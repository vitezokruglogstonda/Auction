using Auction.Server.Models;

namespace Auction.Server.Services.Interfaces
{
    public interface ICacheService
    {
        public Task<User?> GetUser(int userId);
        public Task StoreUserToCache(User user);
        public Task RemoveUserFromCache(int userId);
    }
}
