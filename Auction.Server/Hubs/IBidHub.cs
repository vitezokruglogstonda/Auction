using Auction.Server.Models.Dto;

namespace Auction.Server.Hubs
{
    public interface IBidHub
    {
        Task Bid(BidDto bid);
    }
}
