using Auction.Server.Models;
using Auction.Server.Models.Dto;
using Auction.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Cryptography.X509Certificates;

namespace Auction.Server.Services.Implementation
{
    public class ProfileService : IProfileService
    {
        private readonly AuctionContext DbContext;
        private readonly IPictureService PictureService;

        public ProfileService(AuctionContext context, IPictureService pictureService)
        {
            DbContext = context;
            PictureService = pictureService;
        }

        public async Task<User?> GetUser(int id)
        {
            //return await DbContext.Users.FindAsync(id);
            return await DbContext.Users
                .Where(user => user.Id == id)
                .Include(user => user.CreatedArticles)
                .Include(user => user.BoughtArticles)
                .FirstOrDefaultAsync();
        }
        public async Task<UserProfile?> GetUserProfile(int id)
        {
            User? user = await this.GetUser(id);
            if (user == null)
                return null;
            UserProfile profile = new UserProfile(user, PictureService.MakeProfilePictureUrl(user.ProfilePicturePath));
            return profile;
        }

        public async Task<bool> IsUserACreator(int userId, int articleId)
        {
            //ovo treba pametnije da se uradi

            Article? article = await this.DbContext.Articles.FindAsync(articleId);
            if (article == null) return false;

            User? user = await this.DbContext.Users
                .Where(user => user.Id == userId)
                .Include(user => user.CreatedArticles)
                .FirstOrDefaultAsync();
            if(user == null || user.CreatedArticles == null) return false;

            return user.CreatedArticles.Any(a => article.Id == a.Id);
        }

        public async Task AddFeeToArticleOwner(int articleId, int fee)
        {
            Article? article = await this.DbContext.Articles.FindAsync(articleId);
            if (article == null) return;
            User? creator = await this.DbContext.Users.FindAsync(article.CreatorId);
            if (creator == null) return;
            creator.Balance += fee;
            this.DbContext.Update(creator);
            await this.DbContext.SaveChangesAsync();
            return;
        }

        public async Task<List<User>> GetAllProfiles(int pageSize, int pageIndex)
        {
            //List<UserProfile> userProfiles = new List<UserProfile>();

            List<User> users = await this.DbContext.Users
                .Where(user => user.UserType != UserType.Admin)
                .Skip(pageIndex * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (users.Count > 0)
            {
                foreach (User user in users)
                {
                    user.ProfilePicturePath = PictureService.MakeProfilePictureUrl(user.ProfilePicturePath);
                    //userProfiles.Add(new UserProfile(user, PictureService.MakeProfilePictureUrl(user.ProfilePicturePath)));
                }
            }

            return users;
        }

        public async Task<int> GetTotalNumberOfUsers()
        {
            return await this.DbContext.Users.Where(user => user.UserType != UserType.Admin).CountAsync();
        }

    }
}
