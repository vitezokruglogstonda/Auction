using Auction.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Auction.Server.Middlewares
{
    public class AuthMiddleware
    {
        private readonly RequestDelegate _next;
        public AuthMiddleware(RequestDelegate next)
        {
            _next = next;
        }
        public async Task InvokeAsync(HttpContext httpContext, IAccountService accountService)
        {
            string? token = httpContext.Request.Headers["JWT"].FirstOrDefault()?.Split(" ").Last();

            if (token != null && token != String.Empty)
                await accountService.CheckJwtToken(httpContext, token!);

            await _next(httpContext);
        }
    }
}
