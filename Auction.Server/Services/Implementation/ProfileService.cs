using Auction.Server.Models;
using Auction.Server.Services.Interfaces;

namespace Auction.Server.Services.Implementation
{
    public class ProfileService : IProfileService
    {
        private readonly AuctionContext DbContext;

        public ProfileService(AuctionContext context)
        {
            DbContext = context;
        }

        public async Task<User?> GetUser(int id)
        {
            return await DbContext.Users.FindAsync(id);
        }
    }
}
