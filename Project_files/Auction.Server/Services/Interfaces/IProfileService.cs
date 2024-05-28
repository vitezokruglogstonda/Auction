using Auction.Server.Models;
using Auction.Server.Models.Dto;

namespace Auction.Server.Services.Interfaces
{
    public interface IProfileService
    {
        public Task<User?> GetUser(int id);
        public Task<UserProfile?> GetUserProfile(int id);
        public Task<bool> IsUserACreator(int userId, int articleId);
        public Task AddFeeToArticleOwner(int articleId, int fee);
        public Task<List<User>> GetAllProfiles(int pageSize, int pageIndex);
        public Task<int> GetTotalNumberOfUsers();
    }
}
