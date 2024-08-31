using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Auction.Server.Models.Dto
{
    public class ArticleDto_Request
    {
        [Required]
        public string? Title { get; set; }
        [Required]
        public string? Description { get; set; }
        [Required]
        public int StartingPrice { get; set; }
        [Required]
        public CustomDateTime ExpiryDate { get; set; }
    }

    public class ArticleDto_Response
    {
        public ArticleDto_Response(Article obj) 
        {
            this.Id = obj.Id;
            this.Title = obj.Title;
            this.Description = obj.Description;
            this.StartingPrice = obj.StartingPrice;
            this.SoldPrice = obj.SoldPrice;
            this.Status = obj.Status;
            this.ExpiryDate = obj.ExpiryDate;
            this.CustomerId = obj.CustomerId;
            this.CreatorId = obj.CreatorId;
            this.Pictures = new List<string>();
        }
        public int Id { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public decimal StartingPrice { get; set; }

        public decimal? SoldPrice { get; set; }

        public ArticleStatus Status { get; set; }

        public CustomDateTime ExpiryDate { get; set; }

        public virtual List<string> Pictures { get; set; }

        public int CreatorId { get; set; }
        
        public int? CustomerId { get; set; }
    }

    public class ArticleInfoDto
    {
        public ArticleStatus Status { get; set; }
        public decimal LastPrice { get; set; }  
    }

    public class NotificationArticleInfo
    {
        public int ArticleId { get; set; }
        public string Title { get; set; }
        public decimal LastPrice { get; set; }

        public NotificationArticleInfo(int articleId, string title, decimal lastPrice) 
        {            
            ArticleId = articleId;
            Title = title;
            LastPrice = lastPrice;
        }
    }
}
