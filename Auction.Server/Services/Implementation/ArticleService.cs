using Auction.Server.Models.Dto;
using Auction.Server.Models;
using Microsoft.EntityFrameworkCore;
using Auction.Server.Services.Interfaces;
using System;
using Hangfire;
using Auction.Server.Jobs;

namespace Auction.Server.Services.Implementation
{
    public class ArticleService : IArticleService
    {
        private readonly IPictureService PictureService;
        private readonly AuctionContext DbContext;
        private readonly IConfiguration Configuration;
        private readonly IProfileService ProfileService;
        private readonly IBiddingService BiddingService;
        public ArticleService(AuctionContext context, IPictureService pictureService, IConfiguration _configuration, IProfileService profileService, IBiddingService biddingService)
        {
            PictureService = pictureService;
            DbContext = context;
            Configuration = _configuration;
            ProfileService = profileService;
            BiddingService = biddingService;
        }
        public async Task<ArticleDto_Response?> PublishArticle(User user, ArticleDto_Request newArticle, List<IFormFile> pictures)
        {
            int minimalStartingPrice = Int32.Parse(Configuration.GetSection("ArticleSettings").GetSection("MinimalStartingPrice").Value!);
            int expiryDate = Int32.Parse(Configuration.GetSection("ArticleSettings").GetSection("DefaultExpiryDate").Value!);
            if (string.IsNullOrEmpty(newArticle.Title) || string.IsNullOrEmpty(newArticle.Description) || newArticle.StartingPrice < minimalStartingPrice || pictures == null || !pictures.Any())
                return null;
            if (this.DbContext.Articles.Any(article => article.Title == newArticle.Title))
                return null;

            //DateTime expiryDateTime = DateTime.Now.AddDays(expiryDate);
            DateTime expiryDateTime = DateTime.Now.AddMinutes(1);

            Article article = new Article()
            {
                Title = newArticle.Title,
                Description = newArticle.Description,
                StartingPrice = newArticle.StartingPrice,
                //SoldPrice = null,
                SoldPrice = newArticle.StartingPrice,
                Status = ArticleStatus.Pending,
                ExpiryDate = new CustomDateTime(expiryDateTime), //vazi 2 dana od sad
                CreatorId = user.Id,
                Creator = user,
                CustomerId = null,
                Customer = null,
                Pictures = new List<ArticlePicture>(),
            };
            DbContext.Articles.Add(article);

            //slike
            pictures.ForEach(picture =>
            {
                ArticlePicture newPicture = new ArticlePicture()
                {
                    PicturePath = PictureService.AddArticlePicture(picture),
                    ArticleId = article.Id,     
                    Article = article,
                };
                DbContext.ArticlePictures.Add(newPicture);
                article.Pictures.Add(newPicture);
            });

            DbContext.Entry(user).Collection(u => u.CreatedArticles!).Query().ToList<Article>();
            if (user.CreatedArticles == null)
                user.CreatedArticles = new List<Article>();
            user.CreatedArticles.Add(article);
            DbContext.Update<User>(user);
            await DbContext.SaveChangesAsync();

            DateTimeOffset delay = new (expiryDateTime); 
            BackgroundJob.Schedule<HandleArticleExpirationJob>(job => job.HandleArticleExpiration(article.Id), delay);

            return await MakeArticleDto(article);
        }

        public async Task<List<ArticleDto_Response>?> GetUsersArticles(int userId)
        {
            List<Article> articleObjects;

            articleObjects = await DbContext.Articles
                .Where(article => article.CreatorId == userId || article.CustomerId == userId)
                .Include(article => article.Pictures)
                .ToListAsync();

            if (articleObjects.Count == 0)
                return null;

            return await MakeArticleDto(articleObjects);
        }

        public async Task<List<ArticleDto_Response>?> GetArticles(int pageSize, int pageIndex)
        {
            List<Article> articleObjects;

            articleObjects = await DbContext.Articles
                .Where(article => article.Status == ArticleStatus.Biding || article.Status == ArticleStatus.Pending)
                .Skip(pageIndex * pageSize)
                .Take(pageSize)
                .Include(article => article.Pictures)
                .ToListAsync(); 

            if (articleObjects.Count == 0)
                return null;           

            return await MakeArticleDto(articleObjects);
        }

        private async Task<List<ArticleDto_Response>> MakeArticleDto(List<Article> articleObjects)
        {
            List<ArticleDto_Response> articles = new List<ArticleDto_Response>();
            decimal? lastPrice;
            foreach (Article articleObject in articleObjects)
            {
                ArticleDto_Response article = new ArticleDto_Response(articleObject);
                foreach (ArticlePicture picture in articleObject.Pictures)
                {
                    article.Pictures.Add(PictureService.MakeArticlePictureUrl(picture.PicturePath));
                }
                if (articleObject.Status == ArticleStatus.Biding)
                {
                    lastPrice = await this.BiddingService.GetLastArticlePrice(article.Id);
                    if (lastPrice != null)
                        article.SoldPrice = lastPrice;
                }
                articles.Add(article);
            }

            return articles;
        }

        private async Task<ArticleDto_Response> MakeArticleDto(Article articleObject)
        {
            ArticleDto_Response article = new ArticleDto_Response(articleObject);
            foreach (ArticlePicture picture in articleObject.Pictures)
            {
                article.Pictures.Add(PictureService.MakeArticlePictureUrl(picture.PicturePath));
            }
            if(articleObject.Status == ArticleStatus.Biding)
            {
                decimal? lastPrice = await this.BiddingService.GetLastArticlePrice(article.Id);
                if (lastPrice != null)
                    article.SoldPrice = lastPrice;
            }
            return article;
        }

        public async Task<int> GetNumberOfArticles()
        {
            return await this.DbContext.Articles.Where(article => article.Status == ArticleStatus.Biding || article.Status == ArticleStatus.Pending).CountAsync();
        }

        public async Task<List<ArticleDto_Response>?> SearchArticlesByTitle(string title)
        {
            List<Article> articleObjects;
            articleObjects = await this.DbContext.Articles
                .Where(article => 
                    article.Title.ToLower().Contains(title.ToLower()) 
                    && (article.Status == ArticleStatus.Biding || article.Status == ArticleStatus.Pending))
                .Include(article => article.Pictures)
                .ToListAsync();

            if (articleObjects.Count == 0)
                return null;

            return await MakeArticleDto(articleObjects);

        }

        public async Task<ArticleDto_Response?> GetArticle(int articleId)
        {
            Article? articleObject = await this.DbContext.Articles
                .Where(article => article.Id == articleId)
                .Include(article => article.Pictures)
                .FirstOrDefaultAsync();
            if (articleObject == null)
                return null;
            return await MakeArticleDto(articleObject);
        }

        public async Task<ArticleOwners?> GetArticleOwners(int creatorId, int? customerId)
        {
            UserProfile? creator, customer = null;
            creator = await this.ProfileService.GetUserProfile(creatorId);
            if (creator == null)
                return null;
            if (customerId != null)
                customer = await this.ProfileService.GetUserProfile((int)customerId);            

            ArticleOwners owners = new(creator, customer);
            return owners;
        }

        public async Task<BidCompletionDto?> ExpireArticle(int articleId)
        {
            Article? article = await this.DbContext.Articles
                    .Where(article => article.Id == articleId)
                    .Include(article => article.Creator)
                    .FirstOrDefaultAsync();

            if (article == null)
                return null;

            if(article.Status == ArticleStatus.Pending)
            {
                article.Status = ArticleStatus.Expired;
                this.DbContext.Update(article);
                await this.DbContext.SaveChangesAsync();
                return null;
            }

            if (article.Status != ArticleStatus.Biding)
                return null;

            BidNode? lastBid = await BiddingService.GetLastBid(articleId);

            if (lastBid == null) return null;

            User? buyer = await ProfileService.GetUser(lastBid.UserId);

            article.SoldPrice = lastBid.MoneyAmount;
            article.Customer = buyer;
            if (buyer!.BoughtArticles == null)
            {
                buyer.BoughtArticles = new List<Article>();
            }
            buyer.BoughtArticles.Add(article);
            this.DbContext.Update(buyer);

            article.Status = ArticleStatus.Sold;
            this.DbContext.Update(article);
            await this.DbContext.SaveChangesAsync();

            BidCompletionDto result = new BidCompletionDto
            {
                ArticleInfo = new ArticleInfoDto
                {
                    Status = ArticleStatus.Sold,
                    LastPrice = lastBid.MoneyAmount,
                },
                CustomerProfile = await ProfileService.GetUserProfile(buyer.Id)
            };

            return result;
        }

        //za testiranje
        //public async Task<bool> BuyArticle(User user, int articleId)
        //{
        //    Article? article = await this.DbContext.Articles.FindAsync(articleId);
        //        //.Where(article => article.Id == articleId)
        //        //.Include(article => article.Creator)
        //        //.FirstOrDefaultAsync();

        //    if (article == null) return false;

        //    article.Customer = user;
        //    article.Status = ArticleStatus.Sold;
        //    this.DbContext.Update(article);
        //    if(user.BoughtArticles == null)
        //    {
        //        user.BoughtArticles = new List<Article>();
        //    }
        //    user.BoughtArticles.Add(article);
        //    this.DbContext.Update(user);

        //    await this.DbContext.SaveChangesAsync();

        //    return true;
        //}

    }
}
