using Auction.Server.Attributes;
using Auction.Server.Models;
using Auction.Server.Models.Dto;
using Auction.Server.Services.Implementation;
using Auction.Server.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Auction.Server.Controller
{
    [Route("[controller]")]
    [ApiController]
    public class ArticleController : ControllerBase
    {
        private readonly IArticleService ArticleService;
        private readonly IBiddingService BiddingService;

        public ArticleController(IArticleService ArticleService, IBiddingService biddingService)
        {
            this.ArticleService = ArticleService;
            this.BiddingService = biddingService;
        }

        [Auth]
        [HttpGet]
        [Route("get-number-of-articles")]
        public async Task<ActionResult<int>> GetNumberOfArticles()
        {
            return Ok(await ArticleService.GetNumberOfArticles());
        }

        [Auth]
        [HttpGet]
        [Route("get-articles")]
        public async Task<ActionResult<List<ArticleDto_Response>?>> GetArticles([FromQuery] int pageSize, [FromQuery] int pageIndex)
        {
            List<ArticleDto_Response>? articles = await this.ArticleService.GetArticles(pageSize, pageIndex);
            if (articles == null)
                return NotFound();
            return Ok(articles);
        }

        [Auth]
        [HttpGet]
        [Route("search-articles-by-title")]
        public async Task<ActionResult<List<ArticleDto_Response>?>> SearchArticlesByTitle([FromQuery] string searchQuery)
        {
            List<ArticleDto_Response>? articles = await this.ArticleService.SearchArticlesByTitle(searchQuery);
            if (articles == null)
                return NotFound();
            return Ok(articles);
        }

        [Auth]
        [HttpGet]
        [Route("get-article")]
        public async Task<ActionResult<ArticleDto_Response?>> GetArticle([FromQuery] int articleId)
        {
            ArticleDto_Response? article = await this.ArticleService.GetArticle(articleId);
            if (article == null)
                return NotFound();
            return Ok(article);
        }
        
        [Auth]
        [HttpGet]
        [Route("get-article-owners")]
        public async Task<ActionResult<ArticleOwners?>> GetArticleOwners([FromQuery] int creatorId, [FromQuery] int customerId)
        {
            int? customer_id = (customerId == -1) ? null : customerId;
            ArticleOwners? owners = await this.ArticleService.GetArticleOwners(creatorId, customer_id);
            if (owners == null)
                return NotFound();
            return Ok(owners);
        }

        [Auth]
        [HttpGet]
        [Route("check-if-bidding")]
        public async Task<ActionResult<bool?>> CheckIfBidding([FromQuery] int articleId)
        {
            return Ok(await this.BiddingService.CheckIfUserIsBidding((HttpContext.Items["User"] as User)!.Id, articleId));
        }

        [HttpGet]
        [Route("redirect/{articleId}")]
        public async Task<IActionResult> RedirectToArticle(int articleId)
        {
            return Redirect("https://localhost:4200/article/" + articleId);
        }

    }
}
