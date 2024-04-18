using Auction.Server.Hubs;
using Auction.Server.Models.Dto;
using Auction.Server.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using System.Text.RegularExpressions;

namespace Auction.Server.Jobs
{
    public class HandleArticleExpirationJob
    {
        private readonly IArticleService ArticleService;
        private readonly IHubContext<BidHub> HubContext;

        public HandleArticleExpirationJob(IArticleService articleService, IHubContext<BidHub> hubContext)
        {
            ArticleService = articleService;
            HubContext = hubContext;
        }

        public async Task HandleArticleExpiration(int articleId)
        {
            BidCompletionDto? message = await ArticleService.ExpireArticle(articleId); 
            if (message != null)
                await HubContext.Clients.Group(articleId.ToString()).SendAsync("ArticleSold", message);
        }

    }
}
