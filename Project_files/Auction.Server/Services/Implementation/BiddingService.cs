using Auction.Server.Models;
using Auction.Server.Models.Dto;
using Auction.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using System.Collections.Generic;
using System.Text.Json;
using System.Xml.Linq;
using static System.Net.Mime.MediaTypeNames;

namespace Auction.Server.Services.Implementation
{
    public class BiddingService : IBiddingService
    {
        private readonly AuctionContext DbContext;
        private readonly IDatabase Redis;
        private readonly IConfiguration Configuration;
        private readonly IProfileService ProfileService;

        public BiddingService(IConnectionMultiplexer redis, IConfiguration configuration, AuctionContext dbContext, IProfileService profileService)
        {
            DbContext = dbContext;
            Redis = redis.GetDatabase();
            Configuration = configuration;
            ProfileService = profileService;
        }

        public async Task<ArticleInfoDto?> StartBidding(User user, int articleId)
        {
            Article? article = await this.DbContext.Articles.FindAsync(articleId);
            if (article == null || article.Status == ArticleStatus.Sold || article.Status == ArticleStatus.Expired)
                return null;

            if (await CheckIfUserIsBidding(user.Id, articleId)) return null;

            int fee = Int32.Parse(this.Configuration.GetSection("BidFee").Value!);
            if (user.Balance < fee)
                return null;

            user.Balance -= fee;
            this.DbContext.Update(user);
            await ProfileService.AddFeeToArticleOwner(articleId, fee);
            await this.DbContext.SaveChangesAsync();

            BidListHead? articleBidListHead = await GetBidListHead(articleId);
            if (articleBidListHead == null)
                return null;

            SubscriberNode newNode = new(user.Id, articleId);
            newNode.Next = articleBidListHead.Subs;
            articleBidListHead.Subs = "a_" + articleId.ToString() + "_u_" + user.Id.ToString();

            UsersBiddingListHead? usersBidListHead = await GetUserBiddingListHead(user.Id);
            usersBidListHead!.SubsPointers.Add(articleBidListHead.Subs);

            await this.Redis.StringSetAsync(articleBidListHead.Subs, JsonSerializer.Serialize<SubscriberNode>(newNode));
            await this.Redis.StringSetAsync("a_" + articleId.ToString(), JsonSerializer.Serialize<BidListHead>(articleBidListHead));
            await this.Redis.StringSetAsync("u_" + user.Id.ToString(), JsonSerializer.Serialize<UsersBiddingListHead>(usersBidListHead));

            return new ArticleInfoDto()
            {
                Status = ArticleStatus.Biding,
                LastPrice = (decimal)articleBidListHead.LastPrice!
            };
        }

        public async Task<BidItem?> NewBid(int userId, int articleId, decimal amount)
        {
            User? user = await this.ProfileService.GetUser(userId);
            if(user == null) return null;

            if(await this.ProfileService.IsUserACreator(user.Id, articleId))
                return null;
        //ovaj IF moze da se obrise jer po specifikaciji moze da biduje iako nema pare (takodje i skidanje sa balansa nize)
            if(user.Balance < amount)
                return null;

            int fee = Int32.Parse(this.Configuration.GetSection("BidFee").Value!);
           
            BidListHead? head = await GetBidListHead(articleId, false);
            if (head == null)
                return null;

            if (head.LastPrice + fee > amount) // +fee (cisto da ne bude $1 vise)
                return null;

            BidNode newNode = new(user.Id, articleId, amount, null);
            newNode.Next = head.Bids;
            //head.First = "u_" + newNode.UserId.ToString() + "_" + newNode.ArticleId.ToString(); 
                //(u vezi ovog iznad) sta ako vise bid-a od 1 user-a za taj isti proizvod
            head.Bids = Guid.NewGuid().ToString();
            head.LastPrice = newNode.MoneyAmount;

            await this.Redis.StringSetAsync(head.Bids, JsonSerializer.Serialize<BidNode>(newNode));
            await this.Redis.StringSetAsync("a_" + articleId.ToString(), JsonSerializer.Serialize<BidListHead>(head));

            return new BidItem((await this.ProfileService.GetUserProfile(newNode.UserId))!, newNode.MoneyAmount, articleId);
        }

        public async Task<List<BidItem>?> GetBidList(int articleId)
        {
            BidListHead? head = await GetBidListHead(articleId, false);
            //if (head == null || head!.Bids == null)
            //    return null;

            if (head == null)
                return null;

            List<BidItem> list = new();
            string ? next = head!.Bids;
            string? serializedNode;
            BidNode node;

            while (next != null)
            {
                serializedNode = await this.Redis.StringGetAsync(next);
                if (serializedNode == null)
                    break;
                node = JsonSerializer.Deserialize<BidNode>(serializedNode)!;

                list.Add(new BidItem((await this.ProfileService.GetUserProfile(node.UserId))!, node.MoneyAmount, articleId));

                next = node.Next;
            }

            return list;
        }

        private async Task<BidListHead?> GetBidListHead(int articleId, bool makeNew = true)
        {
            BidListHead? head = null;

            string? headSerialized = await this.Redis.StringGetAsync("a_" + articleId.ToString());

            if (headSerialized.IsNullOrEmpty())
            {
                if (!makeNew)
                    return null;

                Article? article = await this.DbContext.Articles.FindAsync(articleId);
                if (article == null)
                    return null;

                head = new(article.StartingPrice);

                article.Status = ArticleStatus.Biding;
                this.DbContext.Update(article);
                await this.DbContext.SaveChangesAsync();

                await this.Redis.StringSetAsync("a_" + articleId.ToString(), JsonSerializer.Serialize<BidListHead>(head));
            }
            else
            {
                head = JsonSerializer.Deserialize<BidListHead>(headSerialized!);
            }
            return head;
        }

        public async Task<List<SubscriberNode>?> GetUsersBiddingList(int userId)
        {
            UsersBiddingListHead? head = await GetUserBiddingListHead(userId, false);

            if (head == null)
                return null;

            List<SubscriberNode> returnList = new();

            string? serializedNode;
            SubscriberNode node;
            foreach (string subscription in head.SubsPointers)
            {
                serializedNode = await this.Redis.StringGetAsync(subscription);
                if (serializedNode == null)
                    continue;
                node = JsonSerializer.Deserialize<SubscriberNode>(serializedNode)!;
                returnList.Add(node);
            }
            return returnList;
        }

        private async Task<UsersBiddingListHead?> GetUserBiddingListHead(int userId, bool makeNew = true)
        {
            UsersBiddingListHead? head = null;

            string? headSerialized = await this.Redis.StringGetAsync("u_" + userId.ToString());

            if (headSerialized.IsNullOrEmpty())
            {
                if (!makeNew)
                    return null;

                head = new(userId);
                await this.Redis.StringSetAsync("u_" + userId.ToString(), JsonSerializer.Serialize<UsersBiddingListHead>(head));
            }
            else
            {
                head = JsonSerializer.Deserialize<UsersBiddingListHead>(headSerialized!);
            }
            return head;
        }

        public async Task<decimal?> GetLastArticlePrice(int articleId)
        {
            string? headSerialized = await this.Redis.StringGetAsync("a_" + articleId.ToString());
            if (headSerialized.IsNullOrEmpty()) return null;

            BidListHead? head = JsonSerializer.Deserialize<BidListHead>(headSerialized!);
            return head!.LastPrice;
        }
        public async Task<bool> CheckIfUserIsBidding(int userId, int articleId)
        {
            string? headSerialized = await this.Redis.StringGetAsync("a_" + articleId.ToString());
            //if (headSerialized.IsNullOrEmpty())
            if (headSerialized == null || headSerialized.Length == 0)
                return false;
            BidListHead? head = JsonSerializer.Deserialize<BidListHead>(headSerialized!);

            string? next = head!.Subs;
            bool result = false;
            string? serializedNode;
            SubscriberNode node;

            while (next != null)
            {
                serializedNode = await this.Redis.StringGetAsync(next);
                if (serializedNode == null)
                    break;
                node = JsonSerializer.Deserialize<SubscriberNode>(serializedNode)!;
                if(node.UserId == userId)
                {
                    result = true;
                    break;
                }
                next = node.Next;
            }

            return result;
        }

        public async Task<BidNode?> GetLastBid(int articleId)
        {
            BidListHead? head = await GetBidListHead(articleId, false);
            if (head == null)
                return null;

            string? lastBidSerialized = await this.Redis.StringGetAsync(head.Bids);
            if (lastBidSerialized == null)
                return null;

            BidNode node = JsonSerializer.Deserialize<BidNode>(lastBidSerialized)!;

            return node;
        }

        public async Task<BidNode?> GetLastPossibleBid(int articleId)
        {
            BidListHead? head = await GetBidListHead(articleId, false);
            if (head == null)
                return null;

            User? user;
            BidNode tmpNode;
            string? lastBidSerialized, next;

            next = head.Bids;
            while (next != null)
            {
                lastBidSerialized = await this.Redis.StringGetAsync(next);
                if (lastBidSerialized == null)
                    return null;

                tmpNode = JsonSerializer.Deserialize<BidNode>(lastBidSerialized)!;
                user = await ProfileService.GetUser(tmpNode.UserId);
                if (user!.Balance < tmpNode.MoneyAmount)
                {
                    next = tmpNode.Next;
                    continue;
                }

                return tmpNode;
            }

            return null;
        }

        public async Task ClearBidList(int articleId)
        {
            BidListHead? head = await GetBidListHead(articleId, false);
            if (head == null)
                return;
            await this.Redis.KeyDeleteAsync("a_" + articleId.ToString());

            string? next, serializedNode;
            SubscriberNode subNode;
            BidNode bidNode;

            next = head.Subs;
            while (next != null)
            {
                serializedNode = await this.Redis.StringGetAsync(next);
                if (serializedNode == null)
                    break;
                subNode = JsonSerializer.Deserialize<SubscriberNode>(serializedNode)!;

                await this.Redis.KeyDeleteAsync(next);

                await RemoveSubFromUsersBidList(subNode.UserId, serializedNode);

                next = subNode.Next;
            }

            next = head.Bids;
            while (next != null)
            {
                serializedNode = await this.Redis.StringGetAsync(next);
                if (serializedNode == null)
                    break;
                bidNode = JsonSerializer.Deserialize<BidNode>(serializedNode)!;

                await this.Redis.KeyDeleteAsync(next);

                next = bidNode.Next;
            }

        }

        private async Task RemoveSubFromUsersBidList(int userId, string subKey)
        {
            UsersBiddingListHead? head = await GetUserBiddingListHead(userId, false);

            if (head == null)
                return;

            head.SubsPointers.Remove(subKey);
            await this.Redis.StringSetAsync("u_" + userId.ToString(), JsonSerializer.Serialize<UsersBiddingListHead>(head));
        }

        #region Testing

        public async Task<string?> GetVal(string key)
        {
            return await this.Redis.StringGetAsync(key);
        }
        public async Task<string> SetVal(string value)
        {
            string key = Guid.NewGuid().ToString();
            await this.Redis.StringSetAsync(key, value);
            return key;
        }
        public async Task<bool> RemoveVal(string value)
        {
            return await this.Redis.KeyDeleteAsync(value);
        }
        #endregion

    }
}
