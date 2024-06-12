using Auction.Server.Models;
using Auction.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System.Text.Json;
using static System.Net.Mime.MediaTypeNames;

namespace Auction.Server.Services.Implementation
{
    public class CacheService : ICacheService
    {
        private readonly IProfileService ProfileService;
        private readonly IDatabase Redis;
        public CacheService(IConnectionMultiplexer redis, IProfileService profileService) 
        {
            Redis = redis.GetDatabase();
            ProfileService = profileService;
        }

        public async Task<User?> GetUser(int userId)
        {
            User? user = null;
            string? serializedUser;

            serializedUser = await this.Redis.StringGetAsync("user_cache_" + userId.ToString());
            if (serializedUser != null)
            {
               user = JsonSerializer.Deserialize<User>(serializedUser)!;
            }
            else
            {
                user = await this.ProfileService.GetUser(userId);
                if(user != null)
                    await this.Redis.StringSetAsync("user_cache_" + userId.ToString(), JsonSerializer.Serialize<User>(user), TimeSpan.FromMinutes(30));
            }

            return user;
        }

        public async Task StoreUserToCache(User user)
        {
            await this.Redis.StringSetAsync("user_cache_" + user.Id.ToString(), JsonSerializer.Serialize<User>(user), TimeSpan.FromMinutes(30));
        }

        public async Task RemoveUserFromCache(int userId)
        {
            await this.Redis.KeyDeleteAsync("user_cache_" + userId.ToString());
        }
    }
}
