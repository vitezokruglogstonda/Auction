using Auction.Server.Attributes;
using Auction.Server.Models;
using Auction.Server.Models.Dto;
using Auction.Server.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Newtonsoft.Json;
using System;

namespace Auction.Server.Controller
{
    [Route("[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IProfileService ProfileService;
        private readonly IArticleService ArticleService;

        public UserController(IProfileService _profileService, IArticleService articleService)
        {
            ProfileService = _profileService;
            ArticleService = articleService;
        }

        [Auth]
        [HttpGet]
        [Route("get-profile")]
        public async Task<ActionResult<ProfileResponse>> GetProfile([FromQuery] int id)
        {
            UserProfile? profile = await ProfileService.GetUserProfile(id);
            if(profile == null)
                return NotFound();

            ProfileResponse response = new ProfileResponse(profile);
            List<ArticleDto_Response>? articles = await ArticleService.GetUsersArticles(id);
            response.Articles = articles;

            return Ok(response);
        }

        [Auth]
        [HttpGet]
        [Route("get-profile-articles")]
        public async Task<ActionResult<ArticleDto_Response>> GetProfileArticles([FromQuery] int id)
        {
            List<ArticleDto_Response>? articles = await ArticleService.GetUsersArticles(id);
            List<ArticleDto_Response>? biddingArticles = await ArticleService.GetUsersCurrentlyBiddingArticles(id);
            if(biddingArticles != null)
            {
                if (articles == null)
                    articles = new();
                foreach (ArticleDto_Response article in biddingArticles)
                {
                    articles.Add(article);
                }
            }
            if (articles == null)
                return NotFound();
            return Ok(articles);
        }

        [Auth]
        [HttpPost]
        [Route("publish-article")]
        public async Task<ActionResult<ArticleDto_Response?>> PublishArticle([FromForm] string jsonDto, [FromForm] List<IFormFile> pictures)
        {
            ArticleDto_Request? articleDto = JsonConvert.DeserializeObject<ArticleDto_Request>(jsonDto);
            if (articleDto == null)
                return BadRequest("Incorrect data.");
            return Ok(await this.ArticleService.PublishArticle((HttpContext.Items["User"] as User)!, articleDto, pictures));
        }

        //ZA TESTIRANJE
        //[HttpGet]
        //[Route("proba")]
        //public async Task<IActionResult> Proba()
        //{
        //    return Ok("sve oke");
        //}

        //ISKLJUCIVO ZA TESTIRANJE
        //[Auth]
        //[HttpPut]
        //[Route("buy-article")]
        //public async Task<ActionResult<bool>> BuyArticle([FromQuery] int articleId)
        //{
        //    return Ok(await this.ArticleService.BuyArticle((HttpContext.Items["User"] as User)!, articleId));
        //}

    }
}
