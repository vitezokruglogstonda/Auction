using Auction.Server.Models;

namespace Auction.Server.Services.Interfaces
{
    public interface IProfileService
    {
        public Task<User?> GetUser(int id);
    }
}
