using Auction.Server.Hubs;
using Auction.Server.Models;
using Auction.Server.Models.Dto;
using Auction.Server.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using System.Collections.Generic;
using System.Text.Json;

namespace Auction.Server.Services.Implementation
{
    public class NotificationService : INotificationService
    {
        private readonly AuctionContext DbContext;
        private readonly IDatabase Redis;
        private readonly IConfiguration Configuration;
        private readonly IProfileService ProfileService;
        private readonly IHubContext<NotificationHub> HubContext;
        private readonly IMailService MailService;
        private readonly ICacheService CacheService;

        public NotificationService(IConnectionMultiplexer redis, IConfiguration configuration, AuctionContext dbContext, IProfileService profileService, IHubContext<NotificationHub> hubContext, IMailService mailService, ICacheService cacheService)
        {
            DbContext = dbContext;
            Redis = redis.GetDatabase();
            Configuration = configuration;
            ProfileService = profileService;
            HubContext = hubContext;
            MailService = mailService;
            CacheService = cacheService;
        }

        public async Task<List<NotificationNode>?> GetNotificationList(int userId)
        {
            return await this.CacheService.GetNotificationList(userId);
        }

        public async Task AddNotification(int userId, int articleId, decimal lastPrice, NotificationType type, CustomDateTime? endDate = null)
        {
            Article? article = await this.DbContext.Articles.FindAsync(articleId);
            if (article == null) return;

            var notificationTextSection = this.Configuration.GetSection("Notification_text");
            string text;
            switch (type)
            {
                case NotificationType.ArticleExpired:
                    text = notificationTextSection.GetSection("ArticleExpired").Value!;
                    break;
                case NotificationType.BidEnd:
                    text = notificationTextSection.GetSection("BidEnd").Value!;
                    break;
                case NotificationType.TransactionComplete:
                    text = notificationTextSection.GetSection("TransactionComplete").Value!;
                    break;
                case NotificationType.InvalidTransaction:
                    text = notificationTextSection.GetSection("InvalidTransaction").Value!;
                    break;
                default:
                    text = "";
                    break;
            }

            CustomDateTime timestamp = new(DateTime.Now);

            Notification n = new Notification()
            {
                UserId = userId,
                Text = text,
                Timestamp = timestamp,
                ArticleId = articleId,
                Type = type,
                Status = NotificationStatus.NotRead,
                EndDate = endDate
            };
            this.DbContext.Notifications.Add(n);
            User? user = await this.DbContext.Users
                .Where(u => u.Id == userId)
                .Include(u => u.Notifications)
                .FirstOrDefaultAsync();
            if (user!.Notifications == null)
                user.Notifications = new();
            user.Notifications.Add(n);
            this.DbContext.Update<User>(user);
            await DbContext.SaveChangesAsync();

            NotificationArticleInfo articleInfo = new(articleId, article.Title, lastPrice);
            NotificationNode newNotification = new(text, articleInfo, type, timestamp, endDate);

            await this.CacheService.AddNotificationToCache(userId, newNotification);

            //posalji notifikaciju kroz soket
            await HubContext.Clients.Group("n_u_" + userId.ToString()).SendAsync("NewNotification", newNotification);
            //javi mu mejlom
            this.MailService.SendMail(user!.Email, article.Id.ToString(), article.Title, type);
        }

        public async Task MarkAllNotificationsRead(int userId)
        {
            List<Notification> notifications = await this.DbContext.Notifications
                .Where(n => n.UserId == userId && n.Status == NotificationStatus.NotRead)
                .ToListAsync();

            if (notifications.Count == 0) return;

            foreach(Notification n in notifications)
            {
                n.Status = NotificationStatus.Read;
                this.DbContext.Update<Notification>(n);
            }
            await DbContext.SaveChangesAsync();

            await this.CacheService.MarkAllNotificationsReadInCache(userId);
        }

        public async Task Notify(List<int> notificationGroupIds, int articleId, decimal lastPrice, NotificationType type, CustomDateTime? endDate = null)
        {
            if (notificationGroupIds.Count == 0) return;

            foreach(int groupId in notificationGroupIds)
            {
                await this.AddNotification(groupId, articleId, lastPrice, type, endDate);
            }
        }

    }
}
