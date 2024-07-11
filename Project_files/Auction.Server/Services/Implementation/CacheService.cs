using Auction.Server.Models;
using Auction.Server.Models.Dto;
using Auction.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using System;
using System.Text.Json;
using System.Xml.Linq;
using static System.Net.Mime.MediaTypeNames;

namespace Auction.Server.Services.Implementation
{
    public class CacheService : ICacheService
    {
        private readonly IProfileService ProfileService;
        private readonly AuctionContext DbContext;
        private readonly IDatabase Redis;
        private readonly IBiddingService BiddingService;
        
        public CacheService(IConnectionMultiplexer redis, IProfileService profileService, AuctionContext context, IBiddingService biddingService) 
        {
            Redis = redis.GetDatabase();
            ProfileService = profileService;
            DbContext = context;
            BiddingService = biddingService;
        }

        public async Task<User?> GetUser(int userId)
        {
            User? user = null;
            string? serializedUser;

            serializedUser = await this.Redis.StringGetAsync("user_cache_" + userId.ToString());
            if (serializedUser != null)
            {
               user = JsonSerializer.Deserialize<User>(serializedUser)!;
            }
            else
            {
                user = await this.ProfileService.GetUser(userId);
                if(user != null)
                    await this.Redis.StringSetAsync("user_cache_" + userId.ToString(), JsonSerializer.Serialize<User>(user), TimeSpan.FromMinutes(30));
            }

            return user;
        }

        public async Task StoreUserToCache(User user)
        {
            await this.Redis.StringSetAsync("user_cache_" + user.Id.ToString(), JsonSerializer.Serialize<User>(user), TimeSpan.FromMinutes(30));
        }

        public async Task RemoveUserFromCache(int userId)
        {
            await this.Redis.KeyDeleteAsync("user_cache_" + userId.ToString());
        }

        public async Task<List<NotificationNode>?> GetNotificationList(int userId)
        {
            NotificationListHead? head = await GetNotificationListHead(userId, false);

            if (head != null) 
            {
                return await this.GetNotificationListFromCache(head);
            }

            //get from Db

            List<NotificationNode> returnList = new();
            NotificationListHead? newHead = await GetNotificationListHead(userId);
            List<string> keys = new();
            string newNotificationKey = "n_" + Guid.NewGuid().ToString();
            newHead!.Next = newNotificationKey;
            keys.Add(newNotificationKey);
            await this.Redis.StringSetAsync("n_u_" + userId.ToString(), JsonSerializer.Serialize<NotificationListHead>(newHead!), TimeSpan.FromMinutes(30));

            List<Notification>? notifications = await this.DbContext.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.Timestamp.ToDateTime())
                .ToListAsync();

            foreach (Notification n in notifications)
            {
                Article? article = await this.DbContext.Articles
                    .Where(a => a.Id == n.ArticleId)
                    .FirstOrDefaultAsync();
                decimal? lastPrice = await this.BiddingService.GetLastArticlePrice(n.ArticleId);

                NotificationArticleInfo articleInfo = new(n.ArticleId, article!.Title, lastPrice != null ? (decimal)lastPrice : article.StartingPrice);

                NotificationNode newNotification = new(n.Text, articleInfo, n.Type, n.Timestamp, n.EndDate);

                newNotificationKey = "n_" + Guid.NewGuid().ToString();

                keys.Add(newNotificationKey);
                newNotification.Next = newNotificationKey;
                returnList.Add(newNotification);
            }

            returnList.Last().Next = null;

            for(int i = 0; i < returnList.Count; i++)
            {
                await this.Redis.StringSetAsync(keys[i], JsonSerializer.Serialize<NotificationNode>(returnList[i]), TimeSpan.FromMinutes(30));
            }

            return returnList;
        }

        private async Task<List<NotificationNode>?> GetNotificationListFromCache(NotificationListHead head)
        {
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

        public async Task AddNotificationToCache(int userId, NotificationNode notification)
        {
            NotificationListHead? head = await GetNotificationListHead(userId, false);
            if (head == null) return;

            notification.Next = head!.Next;

            string newNotificationKey = "n_" + Guid.NewGuid().ToString();
            head.Next = newNotificationKey;

            await this.Redis.StringSetAsync(newNotificationKey, JsonSerializer.Serialize<NotificationNode>(notification));
            await this.Redis.StringSetAsync("n_u_" + userId.ToString(), JsonSerializer.Serialize<NotificationListHead>(head));
        }

        public async Task MarkAllNotificationsReadInCache(int userId)
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

                if (node.Status == NotificationStatus.Read)
                    break;

                node.Status = NotificationStatus.Read;
                await this.Redis.StringSetAsync(next, JsonSerializer.Serialize<NotificationNode>(node));

                next = node.Next;
            }
        }

    }
}
