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
        private readonly INotificationService NotificationService;
        public ArticleService(AuctionContext context, IPictureService pictureService, IConfiguration _configuration, IProfileService profileService, IBiddingService biddingService, INotificationService notificationService)
        {
            PictureService = pictureService;
            DbContext = context;
            Configuration = _configuration;
            ProfileService = profileService;
            BiddingService = biddingService;
            NotificationService = notificationService;
        }
        public async Task<ArticleDto_Response?> PublishArticle(User user, ArticleDto_Request newArticle, List<IFormFile> pictures)
        {
            //User? user = await this.DbContext.Users.FindAsync(_user.Id);


            int minimalStartingPrice = Int32.Parse(Configuration.GetSection("ArticleSettings").GetSection("MinimalStartingPrice").Value!);
            int expiryDate = Int32.Parse(Configuration.GetSection("ArticleSettings").GetSection("DefaultExpiryDate").Value!);
            if (string.IsNullOrEmpty(newArticle.Title) || string.IsNullOrEmpty(newArticle.Description) || newArticle.StartingPrice < minimalStartingPrice || pictures == null || !pictures.Any())
                return null;
            if (this.DbContext.Articles.Any(article => article.Title == newArticle.Title))
                return null;

            DateTime expiryDateTime = DateTime.Now.AddDays(expiryDate);
            //DateTime expiryDateTime = DateTime.Now.AddMinutes(1);
            //DateTime expiryDateTime = DateTime.Now.AddSeconds(30);

            Article article = new Article()
            {
                Title = newArticle.Title,
                Description = newArticle.Description,
                StartingPrice = newArticle.StartingPrice,
                //SoldPrice = null,
                SoldPrice = newArticle.StartingPrice,
                Status = ArticleStatus.Pending,
                ExpiryDate = new CustomDateTime(expiryDateTime),
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

        public async Task<List<ArticleDto_Response>?> GetUsersCurrentlyBiddingArticles(int userId)
        {
            List<SubscriberNode>? biddingList = await this.BiddingService.GetUsersBiddingList(userId);

            if(biddingList == null)
                return null;

            List<ArticleDto_Response> returnList = new();
            foreach (SubscriberNode node in biddingList)
            {
                if(!node.ArticleId.HasValue)
                    continue;
                ArticleDto_Response? article = await this.GetArticle(node.ArticleId.Value);
                if(article != null)
                    returnList.Add(article);
            }

            return returnList;
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

        public async Task<int> GetTotalNumberOfArticles()
        {
            return await this.DbContext.Articles.CountAsync();
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

        public async Task<List<ArticleDto_Response>?> SearchArticlesByTitle_Admin(string title)
        {
            List<Article> articleObjects;
            articleObjects = await this.DbContext.Articles
                .Where(article => article.Title.ToLower().Contains(title.ToLower()))
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
            BidCompletionDto result;

            Article? article = await this.DbContext.Articles
                    .Where(article => article.Id == articleId)
                    .Include(article => article.Creator)
                    .FirstOrDefaultAsync();

            if (article == null)
                return null;

            BidNode? lastBid = await BiddingService.GetLastBid(articleId);

            if (article.Status == ArticleStatus.Pending || (article.Status == ArticleStatus.Biding && lastBid == null))
            {
                article.Status = ArticleStatus.Expired;
                this.DbContext.Update(article);
                await this.DbContext.SaveChangesAsync();
                //javi kreatoru da je istekao
                await this.NotificationService.AddNotification(article.CreatorId, articleId, article.StartingPrice, NotificationType.ArticleExpired, null);

                return new BidCompletionDto
                {
                    ArticleInfo = new ArticleInfoDto
                    {
                        Status = ArticleStatus.Expired,
                        LastPrice = 0,
                    },
                    CustomerProfile = null
                };
            }

            if (article.Status != ArticleStatus.Biding)
                return null;

            User? buyer = await ProfileService.GetUser(lastBid.UserId);

            List<int> notificationGroupIds = new();
            List<SubscriberNode>? subs = await this.BiddingService.GetSubscriberList(articleId);
            foreach (var sub in subs!)
            {
                if (sub.UserId == buyer!.Id) continue;
                notificationGroupIds.Add(sub.UserId);
            }
            await this.NotificationService.Notify(notificationGroupIds, articleId, lastBid.MoneyAmount, NotificationType.BidEnd);

            if (buyer!.Balance < lastBid.MoneyAmount)
            {
                article.Status = ArticleStatus.WaitingForTransaction;
                this.DbContext.Update(article);
                await this.DbContext.SaveChangesAsync();

                CustomDateTime date = new(DateTime.Now.AddMinutes(1));
                await this.NotificationService.AddNotification(buyer.Id, articleId, lastBid.MoneyAmount, NotificationType.InvalidTransaction, date);
                await this.NotificationService.AddNotification(article.CreatorId, articleId, lastBid.MoneyAmount, NotificationType.BidEnd);

                ResceduleArticleSelling(articleId);

                result = new BidCompletionDto
                {
                    ArticleInfo = new ArticleInfoDto
                    {
                        Status = article.Status,
                        LastPrice = lastBid.MoneyAmount,
                    },
                    CustomerProfile = null
                };
                return result;
            }

            buyer!.Balance -= lastBid.MoneyAmount;
            article.SoldPrice = lastBid.MoneyAmount;
            article.Customer = buyer;
            if (buyer!.BoughtArticles == null)
            {
                buyer.BoughtArticles = new List<Article>();
            }
            buyer.BoughtArticles.Add(article);
            this.DbContext.Update(buyer);

            User? seller = await ProfileService.GetUser(article.Creator!.Id);
            seller!.Balance += lastBid.MoneyAmount;
            this.DbContext.Update(seller);

            article.Status = ArticleStatus.Sold;
            this.DbContext.Update(article);
            await this.DbContext.SaveChangesAsync();

            await BiddingService.ClearBidList(articleId);

            result = new BidCompletionDto
            {
                ArticleInfo = new ArticleInfoDto
                {
                    Status = ArticleStatus.Sold,
                    LastPrice = lastBid.MoneyAmount,
                },
                CustomerProfile = await ProfileService.GetUserProfile(buyer.Id)
            };

            await this.NotificationService.AddNotification(article.CreatorId, articleId, lastBid.MoneyAmount, NotificationType.TransactionComplete);
            await this.NotificationService.AddNotification(buyer.Id, articleId, lastBid.MoneyAmount, NotificationType.TransactionComplete);

            return result;
        }

        private void ResceduleArticleSelling(int articleId)
        {
            DateTime expiryDateTime = DateTime.Now.AddMinutes(1);
            DateTimeOffset delay = new(expiryDateTime);
            BackgroundJob.Schedule<HandleArticleExpirationJob>(job => job.HandleTransaction(articleId), delay);
        }

        public async Task FinishTransaction(int articleId)
        {
            Article? article = await this.DbContext.Articles
                    .Where(article => article.Id == articleId)
                    .Include(article => article.Creator)
                    .FirstOrDefaultAsync();

            if (article == null)
                return;
            
            BidNode? lastBid = await BiddingService.GetLastPossibleBid(articleId);

            if (lastBid == null)
            {
                article.Status = ArticleStatus.Expired;
                this.DbContext.Update(article);
                await this.DbContext.SaveChangesAsync();
                return;
            }

            User? buyer = await ProfileService.GetUser(lastBid.UserId);

            buyer!.Balance -= lastBid.MoneyAmount;
            article.SoldPrice = lastBid.MoneyAmount;
            article.Customer = buyer;
            if (buyer!.BoughtArticles == null)
            {
                buyer.BoughtArticles = new List<Article>();
            }
            buyer.BoughtArticles.Add(article);
            this.DbContext.Update(buyer);

            User? seller = await ProfileService.GetUser(article.Creator!.Id);
            seller!.Balance += lastBid.MoneyAmount;
            this.DbContext.Update(seller);

            article.Status = ArticleStatus.Sold;
            this.DbContext.Update(article);
            await this.DbContext.SaveChangesAsync();

            await BiddingService.ClearBidList(articleId);

            //javi kupcu i prodavcu notifikacijom
            await this.NotificationService.AddNotification(article.CreatorId, articleId, lastBid.MoneyAmount, NotificationType.TransactionComplete);
            await this.NotificationService.AddNotification(buyer.Id, articleId, lastBid.MoneyAmount, NotificationType.TransactionComplete);
        }

        //private async void NotifyThatBidHasEnded(Article article)
        //{
        //    List<int> notificationGroupIds = new();
        //    notificationGroupIds.Add(article.CreatorId);
        //    List<SubscriberNode>? subs = await this.BiddingService.GetSubscriberList(article.Id);
        //    foreach (var sub in subs!)
        //    {
        //        notificationGroupIds.Add(sub.UserId);
        //    }
        //    this.NotificationService.Notify(notificationGroupIds, article.Id, lastBid.MoneyAmount, NotificationType.BidEnd);
        //}

        public async Task<List<ArticleDto_Response>> GetAllArticles(int pageSize, int pageIndex)
        {
            List<ArticleDto_Response> articleDtos;

            List<Article> articles = await DbContext.Articles
                .Skip(pageIndex * pageSize)
                .Take(pageSize)
                .Include(article => article.Pictures)
                .ToListAsync();

            if (articles.Count > 0)
            {
                articleDtos = await MakeArticleDto(articles);
            }
            else
            {
                articleDtos = new List<ArticleDto_Response>();
            }

            return articleDtos;
        }

        public async Task<bool> RepublishArticle(int articleId)
        {
            Article? article = await this.DbContext.Articles
                .Where(article => article.Id == articleId)
                .FirstOrDefaultAsync();

            if (article == null)
                return false;

            int expiryDate = Int32.Parse(Configuration.GetSection("ArticleSettings").GetSection("DefaultExpiryDate").Value!);
            DateTime expiryDateTime = DateTime.Now.AddDays(expiryDate);
            article.ExpiryDate = new CustomDateTime(expiryDateTime);
            article.Status = ArticleStatus.Pending;
            this.DbContext.Update(article);
            await this.DbContext.SaveChangesAsync();

            DateTimeOffset delay = new(expiryDateTime);
            BackgroundJob.Schedule<HandleArticleExpirationJob>(job => job.HandleArticleExpiration(article.Id), delay);

            return true;
        }

        public async Task<bool> RemoveArticle(int articleId)
        {
            Article? article = await this.DbContext.Articles
                .Where(article => article.Id == articleId)
                .Include(article => article.Pictures)
                .FirstOrDefaultAsync();

            if (article == null)
                return false;

            User? articleCreator = await this.DbContext.Users
                .Where(user => user.Id == article.CreatorId)
                .Include(user => user.CreatedArticles)
                .FirstOrDefaultAsync();

            if (articleCreator == null)
                return false;

            //articleCreator.CreatedArticles!.Remove(article);
            //this.DbContext.Update(articleCreator);

            foreach (ArticlePicture picture in article.Pictures)
            {
                this.PictureService.DeleteArticlePicture(picture.PicturePath);
                this.DbContext.Remove(picture);
            }

            this.DbContext.Remove(article);
            this.DbContext.Update(articleCreator);
            await this.DbContext.SaveChangesAsync();
            return true;
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
