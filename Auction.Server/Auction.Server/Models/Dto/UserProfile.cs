using Auction.Server.Services.Interfaces;

namespace Auction.Server.Models.Dto
{
    public class UserProfile
    {
        public UserProfile(User user, string profilePicturePath) 
        {
            this.Id = user.Id;
            this.Email = user.Email;
            this.FirstName = user.FirstName;
            this.LastName = user.LastName;
            this.BirthDate = user.BirthDate;
            this.Gender = user.Gender;
            this.ProfilePicturePath = profilePicturePath;
        }
        public int Id { get; set; }
        public string? Email { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public CustomDate? BirthDate { get; set; }
        public string? Gender { get; set; }
        public string? ProfilePicturePath { get; set; }
    }

    public class ProfileResponse
    {
        public ProfileResponse(UserProfile profile)
        {
            Profile = profile;
        }

        public UserProfile Profile { get; set; }
        public List<ArticleDto_Response>? Articles { get; set; }
    }

    public class ArticleOwners
    {
        public ArticleOwners(UserProfile? creator, UserProfile? customer)
        {
            Creator = creator;
            Customer = customer;
        }

        public UserProfile? Creator { get; set; }
        public UserProfile? Customer { get; set; }
    }
}
