using Auction.Server.Attributes;
using Auction.Server.Models;
using Auction.Server.Models.Dto;
using Auction.Server.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
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
            if (articles == null)
                return NotFound();
            return Ok(articles);
        }

        [Auth]
        [HttpPost]
        [Route("publish-article")]
        public async Task<ActionResult<ArticleDto_Response?>> PublishArticle([FromForm] ArticleDto_Request dto, [FromForm] List<IFormFile> pictures)
        {
            return Ok(await this.ArticleService.PublishArticle((HttpContext.Items["User"] as User)!, dto, pictures));
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
