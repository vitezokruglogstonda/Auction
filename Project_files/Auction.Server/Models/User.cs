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
        //[JsonIgnore]
        public byte[] PasswordHash { get; set; } = [];

        [Required]
        //[Column("Password Salt")]
        //[JsonIgnore]
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

        //[JsonIgnore]
        [Column("Online")]
        public bool OnlineStatus { get; set; }

        [Column("Balance")]
        public decimal Balance { get; set; }

        //[NotMapped]
        public virtual List<Article>? CreatedArticles { get; set; } = new List<Article>();

        //[NotMapped]
        public virtual List<Article>? BoughtArticles { get; set; } = new List<Article>();

        public User(string Email, byte[] PasswordHash, byte[]? PasswordSalt, string FirstName, string LastName, CustomDate BirthDate, string Gender, UserType UserType, string ProfilePicturePath, bool OnlineStatus, decimal Balance)
        {
            this.Email = Email;
            this.PasswordHash = PasswordHash;
            this.PasswordSalt = PasswordSalt;
            this.FirstName = FirstName;
            this.LastName = LastName;
            this.BirthDate = BirthDate;
            this.Gender = Gender;
            this.UserType = UserType;
            this.ProfilePicturePath = ProfilePicturePath;
            this.OnlineStatus = OnlineStatus;
            this.Balance = Balance;
        }

        [JsonConstructor]
        public User(int Id, string Email, byte[] PasswordHash, byte[]? PasswordSalt, string FirstName, string LastName, CustomDate BirthDate, string Gender, UserType UserType, string ProfilePicturePath, bool OnlineStatus, decimal Balance, List<Article>? CreatedArticles, List<Article>? BoughtArticles)
        {
            this.Id = Id;
            this.Email = Email;
            this.PasswordHash = PasswordHash;
            this.PasswordSalt = PasswordSalt;
            this.FirstName = FirstName;
            this.LastName = LastName;
            this.BirthDate = BirthDate;
            this.Gender = Gender;
            this.UserType = UserType;
            this.ProfilePicturePath = ProfilePicturePath;
            this.OnlineStatus = OnlineStatus;
            this.Balance = Balance;
            this.CreatedArticles = CreatedArticles;
            this.BoughtArticles = BoughtArticles;
        }

    }

}
