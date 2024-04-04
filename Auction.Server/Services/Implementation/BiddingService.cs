using Auction.Server.Models;
using Auction.Server.Models.Dto;
using Auction.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using System.Collections.Generic;
using System.Text.Json;
using System.Xml.Linq;

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
            await this.DbContext.SaveChangesAsync();

            BidListHead? head = await GetHead(articleId);
            if (head == null)
                return null;

            SubscriberNode newNode = new(user.Id);
            newNode.Next = head.Subs;
            head.Subs = "a_" + articleId.ToString() + "_u_" + user.Id.ToString();

            await this.Redis.StringSetAsync(head.Subs, JsonSerializer.Serialize<SubscriberNode>(newNode));
            await this.Redis.StringSetAsync("a_" + articleId.ToString(), JsonSerializer.Serialize<BidListHead>(head));

            return new ArticleInfoDto()
            {
                Status = ArticleStatus.Biding,
                LastPrice = (decimal)head.LastPrice!
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
           
            BidListHead? head = await GetHead(articleId, false);
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
            BidListHead? head = await GetHead(articleId, false);
            if (head == null || head!.Bids == null)
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

        private async Task<BidListHead?> GetHead(int articleId, bool makeNew = true)
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
