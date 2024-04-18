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
        private readonly IHttpContextAccessor HttpContextAccessor;

        public BidHub(IBiddingService biddingService, IHttpContextAccessor httpContextAccessor)
        {
            this.BiddingService = biddingService;
            this.HttpContextAccessor = httpContextAccessor;
        }

        //[Auth]
        public async Task Bid(BidDto bid)
        {
            //User? user = this.HttpContextAccessor.HttpContext!.Items["User"] as User;
            BidItem? bidItem = await this.BiddingService.NewBid(bid.UserId, bid.ArticleId, bid.Amount);
            if (bidItem != null)
                await Clients.Group(bid.ArticleId.ToString()).SendAsync("NewBidItem", bidItem);
            else
                await Clients.Caller.SendAsync("NewBidItem", bidItem);
        }

        //[Auth]
        public override async Task OnConnectedAsync()
        {
            //ovde
            await base.OnConnectedAsync();
        }

        //[Auth]
        public Task JoinGroup(int groupId)
        {
            return Groups.AddToGroupAsync(base.Context.ConnectionId, groupId.ToString());
        }

        
        public Task LeaveGroup(int groupId)
        {
            return Groups.RemoveFromGroupAsync(base.Context.ConnectionId, groupId.ToString());
        }

    }
}
