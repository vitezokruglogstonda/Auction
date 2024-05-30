using StackExchange.Redis;
using System.Text.Json.Serialization;

namespace Auction.Server.Models
{
    public class BidNode
    {
        public int UserId { get; set; }
        public decimal MoneyAmount { get; set; }
        public int ArticleId { get; set; }
        public string? Next { get; set; } //userId

        [JsonConstructor]
        public BidNode(int userId, int articleId, decimal moneyAmount, string? next) 
        {
            this.UserId = userId;
            this.ArticleId = articleId;
            this.MoneyAmount = moneyAmount;
            this.Next = next;
        }
    }

    public class SubscriberNode
    {
        public int UserId { get; set; }
        public int? ArticleId{ get; set; }
        public string? Next { get; set; }

        public SubscriberNode(int userId, int? articleId)
        {
            this.UserId = userId;
            this.ArticleId = articleId;
            this.Next = null;
        }

        [JsonConstructor]
        public SubscriberNode(int userId, int? articleId, string? next)
        {
            this.UserId = userId;
            this.ArticleId = articleId;
            this.Next = next;
        }
    }

    public class BidListHead
    {
        public decimal? LastPrice { get; set; }
        public string? Bids { get; set; }
        public string? Subs { get; set; }

        public BidListHead(decimal price) 
        {
            this.LastPrice = price;
            this.Bids = null;
            this.Subs = null;
        }

        [JsonConstructor]
        public BidListHead(decimal? lastPrice, string? bids, string? subs)
        {
            this.LastPrice = lastPrice;
            this.Bids = bids;
            this.Subs = subs;
        }

    }

    public class UsersBiddingListHead
    {
        public int UserId { get; set; }
        public List<string> SubsPointers{ get; set; }

        public UsersBiddingListHead(int userId)
        {
            this.UserId = userId;
            this.SubsPointers = new();
        }

        [JsonConstructor]
        public UsersBiddingListHead(int userId, List<string> subsPointers)
        {
            this.UserId = userId;
            this.SubsPointers = new();
            foreach (string pointer in subsPointers)
            {
                this.SubsPointers.Add(pointer);
            }
        }

    }

}
