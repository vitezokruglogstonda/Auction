using Auction.Server.Models;
using Auction.Server.Services.Interfaces;
using Microsoft.Extensions.Options;
using System.Net;
using System;
using System.Net.Mail;
using static System.Net.Mime.MediaTypeNames;

namespace Auction.Server.Services.Implementation
{
    public class MailService : IMailService
    {
        public MailSettings MailSettings { get; set; }
        public IWebHostEnvironment Environment { get; set; }
        public MailService(IOptions<MailSettings> mailSettings, IWebHostEnvironment environment) 
        {
            this.MailSettings = mailSettings.Value;
            Environment = environment;
        }

        public void SendMail(string userEmail, string articleId, string articleTitle, NotificationType type)
        {
            MailMessage msg = new MailMessage();
            msg.From = new MailAddress(this.MailSettings.SupportEmail, this.MailSettings.Name);
            msg.To.Add(userEmail);
            msg.Subject = this.MailSettings.Subject;
            string path = Path.Combine(Environment.WebRootPath, this.MailSettings.TemplatePath);
            string templateText = System.IO.File.ReadAllText(path);
            string redirectUrl = this.MailSettings.RedirectLink + articleId;
            string text = articleTitle;

            switch (type)
            {
                case NotificationType.ArticleExpired:
                    text += this.MailSettings.Text.ArticleExpired;
                    break;
                case NotificationType.BidEnd:
                    text += this.MailSettings.Text.BidEnd;
                    break;
                case NotificationType.TransactionComplete:
                    text += this.MailSettings.Text.TransactionComplete;
                    break;
                case NotificationType.InvalidTransaction:
                    text += this.MailSettings.Text.InvalidTransaction;
                    break;
                default:
                    break;
            }

            templateText = templateText.Replace("||--text--||", text);
            templateText = templateText.Replace("||--article_link--||", redirectUrl);             

            msg.Body = templateText;
            msg.IsBodyHtml = true;
            var smtpClient = new SmtpClient(this.MailSettings.Host);
            smtpClient.UseDefaultCredentials = false;
            smtpClient.Credentials = new NetworkCredential(this.MailSettings.SupportEmail, this.MailSettings.Password);
            smtpClient.Port = int.Parse(this.MailSettings.Port);
            smtpClient.EnableSsl = true;
            smtpClient.Send(msg);
        }
    }
}
