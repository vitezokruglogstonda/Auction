using Auction.Server.Hubs;
using Auction.Server.Middlewares;
using Auction.Server.Models;
using Auction.Server.Services.Implementation;
using Auction.Server.Services.Interfaces;
using Hangfire;
using Hangfire.Redis.StackExchange;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSignalR();

builder.Services.AddDbContext<AuctionContext>(options =>
   options.UseNpgsql(builder.Configuration.GetConnectionString("DBConnection")));

string? redisConnectionString = builder.Configuration.GetSection("Redis").GetSection("ConnectionString").Value;
ConnectionMultiplexer? multiplexer = ConnectionMultiplexer.Connect(redisConnectionString!);
builder.Services.AddSingleton<IConnectionMultiplexer>(multiplexer);

builder.Services.AddScoped<IBiddingService, BiddingService>(); //AddSingleton
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IPictureService, PictureService>();
builder.Services.AddScoped<IArticleService, ArticleService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

builder.Services.AddHttpContextAccessor();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowOrigin",
        builder =>
        {
            builder.WithOrigins("http://localhost:4200")
                   .AllowAnyHeader()
                   .AllowAnyMethod()
                   .AllowCredentials()
                   .WithExposedHeaders("JWT", "RefreshToken");
        });
});

builder.Services.AddHangfire(config =>
{
    config.UseRedisStorage(
        redisConnectionString,
        new RedisStorageOptions { Prefix = "hangfire:" }
    );
});
builder.Services.AddHangfireServer();

var app = builder.Build();

app.UseHangfireDashboard();
app.UseHangfireServer();

app.UseHttpsRedirection(); 

app.UseStaticFiles();

app.UseRouting();

app.UseCors("AllowOrigin");

app.UseMiddleware<AuthMiddleware>();

app.UseAuthorization();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    endpoints.MapHub<BidHub>("/bid-hub");
    endpoints.MapHub<NotificationHub>("/notification-hub");
});

app.Run();
