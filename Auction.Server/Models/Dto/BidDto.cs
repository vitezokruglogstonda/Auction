namespace Auction.Server.Models.Dto
{
    public class BidDto
    {
        public int UserId { get; set; }
        public int ArticleId { get; set; }
        public int Amount { get; set; }
    }

    public class BidItem
    {
        public UserProfile UserProfile { get; set; }
        public decimal Amount { get; set; }
        public int ArticleId { get; set; }
        public BidItem(UserProfile profile, decimal amount, int articleId) 
        { 
            this.UserProfile = profile;
            this.Amount = amount;
            this.ArticleId = articleId;
        }
    }
}
