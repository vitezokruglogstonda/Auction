using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Auction.Server.Models
{
    [Table("Article")]
    public class Article
    {
        [Key]
        [Required]
        [Column("Id")]
        public int Id { get; set; }

        [Required]
        [Column("Title")]
        public string Title { get; set; } = string.Empty;

        [Required]
        [Column("Description")]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Column("Starting Price")]
        public decimal StartingPrice { get; set; }

        public decimal SoldPrice { get; set;}

        [Column("Status")]
        public ArticleStatus Status { get; set; }

        //[NotMapped]
        public virtual List<ArticlePicture> Pictures { get; set; } = new List<ArticlePicture> ();

        //[Required]
        [JsonIgnore]
        //[ForeignKey("Creator")]
        public int CreatorId { get; set; }
        
        [Required]
        [JsonIgnore]
        public User? Creator { get; set; }

        [JsonIgnore]
        //[ForeignKey("Customer")]
        public int CustomerId { get; set; }

        [JsonIgnore]
        public User? Customer { get; set; }
    }
}
