using System.ComponentModel.DataAnnotations;

namespace Auction.Server.Models.Dto
{
    public class LogInDto
    {
        [Required]
        public string? Email { get; set; }

        [Required]
        public string? Password { get; set; }   
    }
}
