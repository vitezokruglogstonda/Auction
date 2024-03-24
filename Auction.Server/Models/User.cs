using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Auction.Server.Models
{
    [Table("User")]
    public class User
    {
        [Key]
        [Required]
        [Column("Id")]
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        [Column("Email")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [DataType(DataType.Password)]
        [Column("Password Hash")]
        [JsonIgnore]
        public byte[] PasswordHash { get; set; } = [];

        [Required]
        //[Column("Password Salt")]
        [JsonIgnore]
        public byte[]? PasswordSalt { get; set; }

        [Required]
        [Column("First Name")]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [Column("Last Name")]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [DataType(DataType.Date)]
        [Column("Birth Date")]
        public CustomDate BirthDate { get; set; } = new CustomDate();

        [Required]
        [Column("Gender")]
        public string Gender { get; set; } = string.Empty;

        [Required]        
        [Column("Role")]
        public UserType UserType { get; set; }

        [Column("Profile Picture")]
        public string ProfilePicturePath { get; set; } = string.Empty;

        [JsonIgnore]
        [Column("Online")]
        public bool OnlineStatus { get; set; }

        [JsonIgnore]
        [Column("Validated")]
        public bool ValidatedUser { get; set; }

        [Column("Balance")]
        public decimal Balance { get; set; }

        //[NotMapped]
        public virtual List<Article>? CreatedArticles { get; set; } = new List<Article>();

        //[NotMapped]
        public virtual List<Article>? BoughtArticles { get; set; } = new List<Article>();

    }
}
