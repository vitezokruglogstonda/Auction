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

        public NotificationService(IConnectionMultiplexer redis, IConfiguration configuration, AuctionContext dbContext, IProfileService profileService, IHubContext<NotificationHub> hubContext)
        {
            DbContext = dbContext;
            Redis = redis.GetDatabase();
            Configuration = configuration;
            ProfileService = profileService;
            HubContext = hubContext;
        }

        private async Task<NotificationListHead?> GetNotificationListHead(int userId, bool makeNew = true)
        {
            NotificationListHead? head = null;

            string? headSerialized = await this.Redis.StringGetAsync("n_u_" + userId.ToString());

            if (headSerialized.IsNullOrEmpty())
            {
                if (!makeNew)
                    return null;
                                
                head = new(userId);

                await this.Redis.StringSetAsync("n_u_" + userId.ToString(), JsonSerializer.Serialize<NotificationListHead>(head));
            }
            else
            {
                head = JsonSerializer.Deserialize<NotificationListHead>(headSerialized!);
            }
            return head;
        }

        public async Task<List<NotificationNode>?> GetNotificationList(int userId)
        {
            //NotificationListHead? head = await GetNotificationListHead(userId, false);

            //if (head == null) return null;

            NotificationListHead? head = await GetNotificationListHead(userId);

            if (head!.Next == null) return null;

            string? next = head!.Next;
            string? serializedNode;
            NotificationNode node;
            List<NotificationNode> returnList = new();

            while (next != null)
            {
                serializedNode = await this.Redis.StringGetAsync(next);
                if (serializedNode == null)
                    break;
                node = JsonSerializer.Deserialize<NotificationNode>(serializedNode)!;

                returnList.Add(node);

                next = node.Next;
            }

            return returnList;
        }

        public async Task AddNotification(int userId, int articleId, decimal lastPrice, NotificationType type, CustomDateTime? endDate = null)
        {
            Article ? article = await this.DbContext.Articles.FindAsync(articleId);
            if (article == null) return;

            NotificationListHead? head = await GetNotificationListHead(userId);

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

            NotificationArticleInfo articleInfo = new(articleId, article.Title, lastPrice);

            CustomDateTime timestamp = new(DateTime.Now);
            NotificationNode newNotification = new(text, articleInfo, type, timestamp, endDate);
            newNotification.Next = head!.Next;

            string newNotificationKey = "n_" + Guid.NewGuid().ToString();
            head.Next = newNotificationKey;

            await this.Redis.StringSetAsync(newNotificationKey, JsonSerializer.Serialize<NotificationNode>(newNotification));
            await this.Redis.StringSetAsync("n_u_" + userId.ToString(), JsonSerializer.Serialize<NotificationListHead>(head));

            //javi kroz sokete
            await HubContext.Clients.Group("n_u_" + userId.ToString()).SendAsync("NewNotification", newNotification);
        }

        public async Task MarkAllNotificationsRead(int userId)
        {
            NotificationListHead? head = await GetNotificationListHead(userId, false);

            if (head == null) return;

            string? next = head.Next;
            string? serializedNode;
            NotificationNode node;

            while (next != null)
            {
                serializedNode = await this.Redis.StringGetAsync(next);
                if (serializedNode == null)
                    break;
                node = JsonSerializer.Deserialize<NotificationNode>(serializedNode)!;

                node.Status = NotificationStatus.Read;
                await this.Redis.StringSetAsync(next, JsonSerializer.Serialize<NotificationNode>(node));

                next = node.Next;
            }
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
