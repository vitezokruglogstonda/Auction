using Auction.Server.Models.Dto;
using System.Text.Json.Serialization;

namespace Auction.Server.Models
{
    public class NotificationListHead
    {
        public int UserId { get; set; }
        public string? Next { get; set; }

        public NotificationListHead(int userId) 
        {
            UserId = userId;
            Next = null;
        }

        [JsonConstructor]
        public NotificationListHead(int userId, string? next) 
        {
            UserId = userId;
            Next = next;
        }
    }

    public class NotificationNode
    {
        public string Text { get; set; }
        public CustomDateTime Timestamp { get; set; }
        public NotificationArticleInfo ArticleInfo { get; set; }
        public NotificationType Type { get; set; }
        public NotificationStatus Status { get; set; }
        public CustomDateTime? EndDate { get; set; }
        public string? Next { get; set; }

        public NotificationNode(string text, NotificationArticleInfo articleInfo, NotificationType type, CustomDateTime timestamp, CustomDateTime? endDate)
        {
            Text = text;
            ArticleInfo = articleInfo;
            Type = type;
            Status = NotificationStatus.NotRead;
            Timestamp = timestamp;
            EndDate = endDate;
            Next = null;
        }

        [JsonConstructor]
        public NotificationNode(string text, NotificationArticleInfo articleInfo, NotificationType type, NotificationStatus status, CustomDateTime timestamp, CustomDateTime? endDate, string? next)
        {
            Text = text;
            Timestamp = timestamp;
            ArticleInfo = articleInfo;
            Type = type;
            Status = status;
            EndDate = endDate;
            Next = next;
        }
    }

    public enum NotificationType
    {
        ArticleExpired,
        BidEnd,
        TransactionComplete,
        InvalidTransaction
    }

    public enum NotificationStatus
    {
        NotRead,
        Read
    }
}
