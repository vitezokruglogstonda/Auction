using Auction.Server.Models.Dto;
using Auction.Server.Models;

namespace Auction.Server.Services.Interfaces
{
    public interface IArticleService
    {
        public Task<ArticleDto_Response?> PublishArticle(User user, ArticleDto_Request newArticle, List<IFormFile> pictures);
        public Task<List<ArticleDto_Response>?> GetUsersArticles(int userId);
        public Task<List<ArticleDto_Response>?> GetArticles(int pageSize, int pageIndex);
        public Task<int> GetNumberOfArticles();
        public Task<List<ArticleDto_Response>?> SearchArticlesByTitle(string title);
        public Task<ArticleDto_Response?> GetArticle(int articleId);
        public Task<ArticleOwners?> GetArticleOwners(int creatorId, int? customerId);        
        public Task<BidCompletionDto?> ExpireArticle(int articleId);

        //za testiranje
        //public Task<bool> BuyArticle(User user, int articleId);

    }
}
