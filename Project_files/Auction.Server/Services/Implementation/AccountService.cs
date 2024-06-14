using Auction.Server.Models;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using Auction.Server.Models.Dto;
using System;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using Auction.Server.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using System.Reflection;

namespace Auction.Server.Services.Implementation
{
    public enum TokenType
    {
        AccessToken,
        RefreshToken
    }

    public class AccountService : IAccountService
    {
        private readonly ICacheService CacheService;
        private readonly AuctionContext DbContext;
        private readonly IPictureService PictureService;
        private readonly IConfiguration Configuration;

        public AccountService(AuctionContext dbContext, IPictureService pictureService, IConfiguration configuration, ICacheService cacheService)
        {
            DbContext = dbContext;
            PictureService = pictureService;
            Configuration = configuration;
            CacheService = cacheService;
        }

        public bool CheckPassword(string email, string passwordString)
        {
            User? user = DbContext.Users.Where(u => u.Email == email).FirstOrDefault();
            if (user == null)
                return false;

            HMACSHA512 hashObj = new HMACSHA512(user.PasswordSalt!);
            byte[] password = Encoding.UTF8.GetBytes(passwordString);
            byte[] hash = hashObj.ComputeHash(password);

            int len = hash.Length;
            for (int i = 0; i < len; i++)
            {
                if (user.PasswordHash![i] != hash[i])
                {
                    return false;
                }
            }
            return true;
        }

        private void HashPassword(out byte[] hash, out byte[] salt, string passwordString)
        {
            HMACSHA512 hashObj = new HMACSHA512();
            salt = hashObj.Key;
            byte[] password = Encoding.UTF8.GetBytes(passwordString);
            hash = hashObj.ComputeHash(password);
        }

        public async Task CheckJwtToken(HttpContext httpContext, string token)
        {
            try
            {
                JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
                byte[] key = Encoding.ASCII.GetBytes(Configuration.GetSection("Jwt").GetSection("Key").Value!);
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.FromMinutes(10)
                }, out SecurityToken validatedToken);

                JwtSecurityToken jwtToken = (JwtSecurityToken)validatedToken;

                int userId = int.Parse(jwtToken.Claims.First(x => x.Type == "id").Value);

                if (jwtToken.ValidTo < DateTime.UtcNow)
                    return;

                //User? user = await DbContext.Users.FindAsync(userId);
                User? user = await this.CacheService.GetUser(userId);

                if (user != null && user.OnlineStatus)
                {
                    httpContext.Items["User"] = user;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }            
        }

        public void GenerateJwtToken(User user, HttpContext httpContext, TokenType tokenType)
        {
            TimeSpan tokenLifetime;
            string jwtConfigLifetime, headerField;
            switch (tokenType)
            {
                case TokenType.AccessToken:
                    jwtConfigLifetime = "AccessTokenLifetime";
                    headerField = "JWT";
                    break;
                case TokenType.RefreshToken:
                    jwtConfigLifetime = "RefreshTokenLifetime";
                    headerField = "RefreshToken";
                    break;
                default:
                    jwtConfigLifetime = "RefreshTokenLifetime";
                    headerField = "RefreshToken";
                    break;
            }
            tokenLifetime = TimeSpan.Parse(Configuration.GetSection("Jwt").GetSection(jwtConfigLifetime).Value!);

            JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
            byte[] key = Encoding.ASCII.GetBytes(Configuration.GetSection("Jwt").GetSection("Key").Value!);
            SecurityTokenDescriptor tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] { new Claim("id", user.Id.ToString()) }),
                Expires = DateTime.UtcNow.Add(tokenLifetime), 
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            SecurityToken securityToken = tokenHandler.CreateToken(tokenDescriptor);
            string token = tokenHandler.WriteToken(securityToken);

            httpContext.Response.Headers[headerField] = token;
        }

        public void RefreshAccessToken(HttpContext httpContext)
        {
            this.GenerateJwtToken((httpContext.Items["User"] as User)!, httpContext, TokenType.AccessToken);
        }

        public bool CheckIfEmailExists(string email)
        {
            return DbContext.Users.Any(u => string.Equals(u.Email, email));
        }

        public async Task<bool> AddNewUser(RegisterDto dto, IFormFile? picture)
        {
            if (CheckIfEmailExists(dto.Email!))
                return false;

            if (dto.Password == null)
                return false;

            byte[] hash, salt;
            HashPassword(out hash, out salt, dto.Password);

            string picturePath = PictureService.AddProfilePicture(picture);
            User user = new User(
                dto.Email!,
                hash,
                salt,
                dto.FirstName!,
                dto.LastName!,
                dto.BirthDate!,
                dto.Gender!,
                UserType.RegisteredUser,
                picturePath,
                false,
                0
            );

            await DbContext.Users.AddAsync(user);
            await DbContext.SaveChangesAsync();

            return true;
        }

        public async Task<UserDto> LogUserIn(string email, HttpContext httpContext)
        {
            User? user = await DbContext.Users.FirstOrDefaultAsync(x => x.Email == email);            
            user!.OnlineStatus = true;
            DbContext.Update(user);
            await DbContext.SaveChangesAsync();
            user.ProfilePicturePath = PictureService.MakeProfilePictureUrl(user.ProfilePicturePath!);
            GenerateJwtToken(user, httpContext, TokenType.AccessToken);
            GenerateJwtToken(user, httpContext, TokenType.RefreshToken);
            await this.CacheService.StoreUserToCache(user!);
            return new UserDto(user);
        }

        public async Task<bool> LogUserOut(int userId)
        {
            User? user = await DbContext.Users.FindAsync(userId);
            if (user == null)
                return false;
            if (user.OnlineStatus)
            {
                user.OnlineStatus = false;
                DbContext.Update(user);
                await DbContext.SaveChangesAsync();
            }
            await this.CacheService.RemoveUserFromCache(userId);
            return true;
        }

        public async Task<string?> ChangeProfilePicture(User user, IFormFile? picture)
        {
            if (picture == null)
                return null;
            string newPicturePath = PictureService.AddProfilePicture(picture);
            string oldPicturePath = user.ProfilePicturePath;
            user.ProfilePicturePath = newPicturePath;            
            this.DbContext.Update(user);
            await DbContext.SaveChangesAsync();
            if(!String.Equals(oldPicturePath, Configuration.GetSection("EnvironmentVariables").GetSection("DefaultProfilePicturePath").Value!))
                this.PictureService.DeleteProfilePicture(oldPicturePath);
            return PictureService.MakeProfilePictureUrl(newPicturePath);
        }

        public async Task<decimal?> AddMoneyToBalance(User user, int? amount)
        {
            if (amount == null)
                return null;
            user.Balance += (decimal)amount;
            this.DbContext.Update(user);
            await DbContext.SaveChangesAsync();
            return user.Balance;
        }

        public async Task CreateAdmin()
        {
            User? admin = await DbContext.Users
                .Where(user => user.UserType == UserType.Admin).FirstOrDefaultAsync();

            if (admin != null) return;

            byte[] hash, salt;
            HashPassword(out hash, out salt, "admin");

            string picturePath = PictureService.AddProfilePicture(null);

            admin = new User(
                "admin",
                hash,
                salt,
                "Admin",
                "",
                new CustomDate
                {
                    Day = DateTime.Now.Day,
                    Month = DateTime.Now.Month,
                    Year = DateTime.Now.Year,
                },
                "",
                UserType.Admin,
                picturePath,
                false,
                0
            );

            await DbContext.Users.AddAsync(admin);
            await DbContext.SaveChangesAsync();
        }
    }
}
