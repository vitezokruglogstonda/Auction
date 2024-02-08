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
        private readonly IPictureService PictureService;
        public UserController(IProfileService _profileService, IPictureService pictureService)
        {
            ProfileService = _profileService;
            PictureService = pictureService;
        }

        [HttpGet]
        [Route("get-rofile")]
        public async Task<ActionResult<UserProfile>> GetProfile([FromQuery] int id)
        {
            User? user = await ProfileService.GetUser(id);
            if(user == null)
                return NotFound();
            UserProfile profile = new UserProfile(user, PictureService.MakeProfilePictureUrl(user.ProfilePicturePath));
            return Ok(profile);
        }

        
    }
}
