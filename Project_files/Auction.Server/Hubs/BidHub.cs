using Auction.Server.Attributes;
using Auction.Server.Models;
using Auction.Server.Models.Dto;
using Auction.Server.Services.Implementation;
using Auction.Server.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Win32;
namespace Auction.Server.Hubs
{
    public class BidHub : Hub
    {
        private readonly IBiddingService BiddingService;

        public BidHub(IBiddingService biddingService)
        {
            this.BiddingService = biddingService;
        }

        public async Task Bid(BidDto bid)
        {
            BidItem? bidItem = await this.BiddingService.NewBid(bid.UserId, bid.ArticleId, bid.Amount);
            if (bidItem != null)
                await Clients.Group(bid.ArticleId.ToString()).SendAsync("NewBidItem", bidItem);
            else
                await Clients.Caller.SendAsync("NewBidItem", bidItem);
        }

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public Task JoinBidingGroup(int groupId)
        {
            return Groups.AddToGroupAsync(base.Context.ConnectionId, groupId.ToString());
        }

        
        public Task LeaveBidingGroup(int groupId)
        {
            return Groups.RemoveFromGroupAsync(base.Context.ConnectionId, groupId.ToString());
        }

    }
}
