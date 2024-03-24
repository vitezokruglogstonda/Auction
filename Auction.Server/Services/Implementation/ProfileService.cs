using Auction.Server.Models;
using Auction.Server.Models.Dto;
using Auction.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

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
            return await DbContext.Users.FindAsync(id);
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

    }
}
