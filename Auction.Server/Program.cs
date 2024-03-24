using Auction.Server.Middlewares;
using Auction.Server.Models;
using Auction.Server.Services.Implementation;
using Auction.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

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


builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin();
        policy.AllowAnyHeader();
        policy.AllowAnyMethod();
        policy.WithExposedHeaders("JWT", "RefreshToken");
    });
});

//var configuration = ConfigurationOptions.Parse("localhost:6379");
//var redisConnection = ConnectionMultiplexer.Connect(configuration);

var app = builder.Build();

app.UseHttpsRedirection(); 

app.UseStaticFiles();

app.UseRouting();

app.UseCors();

app.UseMiddleware<AuthMiddleware>();

app.UseAuthorization();

app.MapControllers();

app.Run();

//redisConnection.Close();
