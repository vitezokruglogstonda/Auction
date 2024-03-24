using StackExchange.Redis;

namespace Auction.Server.Models
{
    public class BidNode
    {
        public int UserId { get; set; }
        public decimal MoneyAmount { get; set; }
        public int ArticleId { get; set; }
        public string? Next { get; set; } //userId

        public BidNode(int userId, int articleId, decimal amount, string? next) 
        {
            this.UserId = userId;
            this.ArticleId = articleId;
            this.MoneyAmount = amount;
            this.Next = next;
        }
    }

    public class BidListHead
    {
        public decimal? LastPrice { get; set; }
        public string? First { get; set; }

        public BidListHead(decimal price) 
        {
            this.LastPrice = price;
            this.First = null;
        }
    }

}
