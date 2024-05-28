using System.ComponentModel.DataAnnotations;

namespace Auction.Server.Models.Dto
{
    public class RegisterDto
    {
        [Required]
        public string? Email { get; set; }
        [Required]
        public string? Password { get; set; }
        [Required]
        public string? FirstName{ get; set; }
        [Required]
        public string? LastName { get; set; }
        [Required]
        public CustomDate? BirthDate{ get; set; }
        [Required]
        public string? Gender { get; set; }
    }
}
