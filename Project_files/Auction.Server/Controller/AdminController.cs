using Auction.Server.Attributes;
using Auction.Server.Models;
using Auction.Server.Models.Dto;
using Auction.Server.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Auction.Server.Controller
{
    [Route("[controller]")]
    [ApiController]
    [Auth(new string[] { nameof(UserType.Admin) })]
    public class AdminController : ControllerBase
    {
        private readonly IArticleService ArticleService;
        private readonly IProfileService ProfileService;
        public AdminController(IArticleService articleService, IProfileService profileService) 
        {
            ArticleService = articleService;
            ProfileService = profileService;
        }

        [HttpGet]
        [Route("get-total-number-of-users")]
        public async Task<ActionResult<int>> GetTotalNumberOfUsers()
        {
            return Ok(await this.ProfileService.GetTotalNumberOfUsers());
        }

        [HttpGet]
        [Route("get-total-number-of-articles")]
        public async Task<ActionResult<int>> GetTotalNumberOfArticles()
        {
            return Ok(await this.ArticleService.GetTotalNumberOfArticles());
        }

        [HttpGet]
        [Route("get-all-users")]
        public async Task<ActionResult<List<UserDto>>> GetAllUsers([FromQuery] int pageSize, [FromQuery] int pageIndex)
        {
            List<UserDto> users = await this.ProfileService.GetAllProfiles(pageSize, pageIndex);
            return Ok(users);
        }

        [HttpGet]
        [Route("get-all-articles")]
        public async Task<ActionResult<List<ArticleDto_Response>>> GetAllArticles([FromQuery] int pageSize, [FromQuery] int pageIndex)
        {
            List<ArticleDto_Response> articles = await this.ArticleService.GetAllArticles(pageSize, pageIndex);
            return Ok(articles);
        }

        [HttpGet]
        [Route("search-articles-by-title")]
        public async Task<ActionResult<List<ArticleDto_Response>?>> SearchArticlesByTitle([FromQuery] string searchQuery)
        {
            List<ArticleDto_Response>? articles = await this.ArticleService.SearchArticlesByTitle_Admin(searchQuery);
            if (articles == null)
                return NotFound();
            return Ok(articles);
        }

        [HttpPost]
        [Route("republish-article")]
        public async Task<ActionResult<bool>> RepublishArticle([FromQuery] int articleId)
        {
            return Ok(await this.ArticleService.RepublishArticle(articleId));
        }

        [HttpDelete]
        [Route("remove-article")]
        public async Task<ActionResult<bool>> RemoveArticle([FromQuery] int articleId)
        {
            return Ok(await this.ArticleService.RemoveArticle(articleId));
        }

    }
}
