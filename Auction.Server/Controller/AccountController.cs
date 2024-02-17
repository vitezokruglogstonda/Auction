using Auction.Server.Attributes;
using Auction.Server.Models;
using Auction.Server.Models.Dto;
using Auction.Server.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Auction.Server.Controller
{
    [Route("[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService AccountService;

        public AccountController(IAccountService _accountService)
        {
            AccountService = _accountService;
        }

        [HttpPost]
        [Route("register")]
        public async Task<ActionResult<User>> Register([FromForm] string jsonDto, [FromForm] IFormFile? picture)
        {
            RegisterDto? userDto = JsonConvert.DeserializeObject<RegisterDto>(jsonDto);

            if (userDto == null)
                return BadRequest("Incorrect user information.");

            if(! await this.AccountService.AddNewUser(userDto, picture))
                return BadRequest("Error while registering new user.");

            return Ok(await this.AccountService.LogUserIn(userDto.Email!, HttpContext));
        }

        [HttpGet]
        [Route("check-email")]
        public IActionResult CheckEmail([FromQuery] string email)
        {
            //return Ok(new{result = this.AccountService.CheckIfEmailExists(email)});
            return Ok(this.AccountService.CheckIfEmailExists(email));
        }

        [HttpPut]
        [Route("log-in")]
        public async Task<ActionResult<User>> LogIn([FromBody] LogInDto dto)
        {
            if(dto == null) 
                return BadRequest("Invalid login data.");
            if (!this.AccountService.CheckIfEmailExists(dto.Email!))
                return BadRequest("Wrong email address.");
            if (!this.AccountService.CheckPassword(dto.Email!, dto.Password!))
                return BadRequest("Wrong password");
            return Ok(await this.AccountService.LogUserIn(dto.Email!, HttpContext));
        }

        [Auth]
        [HttpGet]
        [Route("log-out")]
        public async Task<ActionResult<bool>> LogOut()
        {
            return Ok(await this.AccountService.LogUserOut((HttpContext.Items["User"] as User)!.Id));
        }
                
        [Auth]
        [HttpPut]
        [Route("change-profile-photo")]
        public async Task<ActionResult<Task<string?>>> ChangeProfilePicture([FromForm] IFormFile? picture)
        {
            return Ok(new {path = await this.AccountService.ChangeProfilePicture((HttpContext.Items["User"] as User)!, picture) });
        }

        [Auth]
        [HttpPut]
        [Route("add-money-to-balance")]
        public async Task<ActionResult<decimal?>> AddMoneyToBalance([FromBody] int? amount)
        {
            return Ok(await this.AccountService.AddMoneyToBalance((HttpContext.Items["User"] as User)!, amount));
        }

        [Auth]
        [HttpGet]
        [Route("check-if-authorized")]
        public ActionResult<UserType?> CheckIfAuthorized()
        {
            return Ok((HttpContext.Items["User"] as User)!.UserType);
        }

        [Auth]
        [HttpGet]
        [Route("refresh-token")]
        public IActionResult RefreshAccessToken()
        {
            this.AccountService.RefreshAccessToken(HttpContext);
            return Ok();
        }

    }
}
