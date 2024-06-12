namespace Auction.Server.Models
{
    public class MailSettings
    {
        public string Host { get; set; }
        public string Port { get; set; }
        public string TemplatePath { get; set; }
        public string SupportEmail { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
        public string Subject { get; set; }
        public string RedirectLink { get; set; }    
        public NotificationText Text { get; set; }
    }

    public class NotificationText
    {
        public string ArticleExpired { get; set; }
        public string BidEnd { get; set; }
        public string TransactionComplete { get; set; }
        public string InvalidTransaction { get; set; }
    }
}
