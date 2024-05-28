using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Auction.Server.Models
{
    [Table("ArticlePicture")]
    public class ArticlePicture
    {
        [Key]
        [Column("Id")]
        public int Id { get; set; }

        [Required]
        [Column("Picture Data")]
        public string PicturePath { get; set; } = string.Empty;

        //[Required]
        [JsonIgnore]
        //[ForeignKey("Article")]
        public int ArticleId { get; set; }

        [JsonIgnore]
        public Article? Article { get; set; }
    }
}
