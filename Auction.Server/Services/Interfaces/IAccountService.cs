using Auction.Server.Models;
using Auction.Server.Models.Dto;

namespace Auction.Server.Services.Interfaces
{
    public interface IAccountService
    {
        public bool CheckPassword(string email, string passwordString);
        public Task CheckJwtToken(HttpContext httpContext, string token);
        public void GenerateJwtToken(User user, HttpContext httpContext);
        public bool CheckIfEmailExists(string email);
        public Task<bool> AddNewUser(RegisterDto dto, IFormFile? picture);
        public Task<User> LogUserIn(string email, HttpContext httpContext);
        public Task<bool> LogUserOut(int userId);
        public Task<string?> ChangeProfilePicture(User user, IFormFile? picture);
        public Task<decimal?> AddMoneyToBalance(User user, int? amount);
    }
}
