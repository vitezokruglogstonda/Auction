﻿using Auction.Server.Models;
using Auction.Server.Models.Dto;

namespace Auction.Server.Services.Interfaces
{
    public interface IBiddingService
    {
        public Task<ArticleInfoDto?> StartBidding(User user, int articleId);
        public Task<BidItem?> NewBid(int userId, int articleId, decimal amount);
        public Task<List<BidItem>?> GetBidList(int articleId);
        public Task<List<SubscriberNode>?> GetSubscriberList(int articleId);
        public Task<List<SubscriberNode>?> GetUsersBiddingList(int userId); 
        public Task<decimal?> GetLastArticlePrice(int articleId);
        public Task<bool> CheckIfUserIsBidding(int userId, int articleId);
        public Task<BidNode?> GetLastBid(int articleId);
        public Task<BidNode?> GetLastPossibleBid(int articleId);
        public Task ClearBidList(int articleId);
        #region Testing
        public Task<string?> GetVal(string key);
        public Task<string> SetVal(string value);
        public Task<bool> RemoveVal(string value);

        #endregion
    }
}
