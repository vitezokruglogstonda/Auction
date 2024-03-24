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

        public async Task<bool> StartBidding(User user, int articleId)
        {
            Article? article = await this.DbContext.Articles.FindAsync(articleId);
            if (article == null || article.Status == ArticleStatus.Sold || article.Status == ArticleStatus.Expired)
                return false;
            if(article.Status == ArticleStatus.Pending)
            {
                article.Status = ArticleStatus.Biding;
                this.DbContext.Update(article);
            }

            if (await CheckIfUserIsBidding(user.Id, articleId)) return false;

            int fee = Int32.Parse(this.Configuration.GetSection("BidFee").Value!);
            if (user.Balance < fee)
                return false;

            user.Balance -= fee;
            this.DbContext.Update(user);
            await this.DbContext.SaveChangesAsync();

            BidListHead? head = await GetHead(articleId);
            if (head == null)
                return false;

            return true;
        }

        public async Task<BidItem?> NewBid(User user, int articleId, decimal amount)
        {
            if(await this.ProfileService.IsUserACreator(user.Id, articleId))
                return null;
        //ovaj IF moze da se obrise jer po specifikaciji moze da biduje iako nema pare (takodje i skidanje sa balansa nize)
            if(user.Balance < amount)
                return null;

            int fee = Int32.Parse(this.Configuration.GetSection("BidFee").Value!);
           
            BidListHead? head = await GetHead(articleId, false);
            if (head == null)
                return null;

            if (head.LastPrice + fee >= amount) // +fee (cisto da ne bude $1 vise)
                return null;

        //ovo moze da se brise ako se ne skida sa balansa
            user.Balance -= amount;
            this.DbContext.Update(user);
            await this.DbContext.SaveChangesAsync();

            BidNode newNode = new(user.Id, articleId, amount, null);
            newNode.Next = head.First;
            //head.First = "u_" + newNode.UserId.ToString() + "_" + newNode.ArticleId.ToString(); 
                //(u vezi ovog iznad) sta ako vise bid-a od 1 user-a za taj isti proizvod
            head.First = Guid.NewGuid().ToString();
            head.LastPrice = newNode.MoneyAmount;

            await this.Redis.StringSetAsync(head.First, JsonSerializer.Serialize<BidNode>(newNode));
            await this.Redis.StringSetAsync("a_" + articleId.ToString(), JsonSerializer.Serialize<BidListHead>(head));

            return new BidItem((await this.ProfileService.GetUserProfile(newNode.UserId))!, newNode.MoneyAmount);
        }

        public async Task<List<BidItem>?> GetBidList(int articleId)
        {
            BidListHead? head = await GetHead(articleId, false);
            if (head == null || head!.First == null)
                return null;

            List<BidItem> list = new();
            string ? next = head!.First;
            string? serializedNode;
            BidNode node;

            while (next != null)
            {
                serializedNode = await this.Redis.StringGetAsync(next);
                if (serializedNode == null)
                    break;
                node = JsonSerializer.Deserialize<BidNode>(serializedNode)!;

                list.Add(new BidItem((await this.ProfileService.GetUserProfile(node.UserId))!, node.MoneyAmount));

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
            if (headSerialized == null) return null;

            BidListHead? head = JsonSerializer.Deserialize<BidListHead>(headSerialized!);
            return head!.LastPrice;
        }
        public async Task<bool> CheckIfUserIsBidding(int userId, int articleId)
        {
            string? headSerialized = await this.Redis.StringGetAsync("a_" + articleId.ToString());
            if (headSerialized.IsNullOrEmpty())
                return false;
            BidListHead? head = JsonSerializer.Deserialize<BidListHead>(headSerialized!);

            string? next = head!.First;
            bool result = false;
            string? serializedNode;
            BidNode node;

            while (next != null)
            {
                serializedNode = await this.Redis.StringGetAsync(next);
                if (serializedNode == null)
                    break;
                node = JsonSerializer.Deserialize<BidNode>(serializedNode)!;
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
