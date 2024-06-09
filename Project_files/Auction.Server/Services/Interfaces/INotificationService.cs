using Auction.Server.Models;

namespace Auction.Server.Services.Interfaces
{
    public interface INotificationService
    {
        public Task<List<NotificationNode>?> GetNotificationList(int userId);
        public Task AddNotification(int userId, int articleId, decimal lastPrice, NotificationType type, CustomDateTime? endDate = null);
        public Task MarkAllNotificationsRead(int userId);
        public Task Notify(List<int> notificationGroupIds, int articleId, decimal lastPrice, NotificationType type, CustomDateTime? endDate = null);
    }
}
