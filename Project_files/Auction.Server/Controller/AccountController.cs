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
        private readonly INotificationService NotificationService;

        public AccountController(IAccountService _accountService, INotificationService notificationService)
        {
            AccountService = _accountService;
            NotificationService = notificationService;
        }

        [HttpPost]
        [Route("register")]
        public async Task<ActionResult<UserDto>> Register([FromForm] string jsonDto, [FromForm] IFormFile? picture)
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
        public async Task<ActionResult<UserDto>> LogIn([FromBody] LogInDto dto)
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
        [HttpPut]
        [Route("log-in-with-token")]
        public async Task<ActionResult<UserDto>> LogInWithToken()
        {
            return Ok(await this.AccountService.LogUserIn((HttpContext.Items["User"] as User)!.Email, HttpContext));
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
        [HttpPost]
        [Route("refresh-token")]
        public IActionResult RefreshAccessToken()
        {
            this.AccountService.RefreshAccessToken(HttpContext);
            return Ok();
        }

        [HttpGet]
        [Route("create-admin")]
        public async Task<IActionResult> CreateAdmin()
        {
            try
            {
                await this.AccountService.CreateAdmin();
                return Ok();
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Auth]
        [HttpGet]
        [Route("get-notifications")]
        public async Task<List<NotificationNode>?> GetNotifications([FromQuery] int userId)
        {
            return await this.NotificationService.GetNotificationList(userId);
        }

        [Auth]
        [HttpGet]
        [Route("mark-all-notifications-read")]
        public async Task<IActionResult> MarkNotifications([FromQuery] int userId)
        {
            await this.NotificationService.MarkAllNotificationsRead(userId);
            return Ok();
        }

        [HttpGet]
        [Route("clear-database")]
        public async Task<IActionResult> ClearDatabase()
        {
            await this.AccountService.ClearDatabase();
            return Ok();
        }

    }
}
