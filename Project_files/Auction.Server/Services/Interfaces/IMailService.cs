using Auction.Server.Models;

namespace Auction.Server.Services.Interfaces
{
    public interface IMailService
    {
        public void SendMail(string userEmail, string articleId, string articleTitle, NotificationType type);
    }
}
