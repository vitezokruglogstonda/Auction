using Auction.Server.Attributes;
using Auction.Server.Models;
using Auction.Server.Models.Dto;
using Auction.Server.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace Auction.Server.Controller
{
    [Route("[controller]")]
    [ApiController]
    public class BidController : ControllerBase
    {
        private readonly IBiddingService BiddingService;

        public BidController(IBiddingService biddingService)
        {
            BiddingService = biddingService;
        }

        [Auth]
        [HttpGet]
        [Route("start-bidding")]
        public async Task<ActionResult<ArticleInfoDto?>> StartBidding([FromQuery] int articleId)
        {
            return Ok(await this.BiddingService.StartBidding((HttpContext.Items["User"] as User)!, articleId));
        }

        //ovo dole ide u sokete

        [Auth]
        [HttpPost]
        [Route("new-bid")]
        public async Task<ActionResult<BidItem?>> NewBid([FromBody] BidDto bid)
        {
            BidItem? bidItem = await this.BiddingService.NewBid((HttpContext.Items["User"] as User)!.Id, bid.ArticleId, bid.Amount);
            if (bidItem == null)
                return BadRequest();
            return Ok(bidItem);
        }

        [Auth]
        [HttpGet]
        [Route("get-bid-list")]
        public async Task<ActionResult<List<BidItem>?>> GetBidList([FromQuery] int articleId)
        {
            List<BidItem>? bids = await this.BiddingService.GetBidList(articleId);
            if (bids == null)
                return BadRequest();
            return Ok(bids);
        }

        #region Testing

        [HttpGet]
        [Route("get-val")]
        public async Task<ActionResult<string>> GetVal([FromQuery] string key) 
        {
            return Ok(await this.BiddingService.GetVal(key));
        }

        [HttpPost]
        [Route("set-val")]
        public async Task<ActionResult<string>> SetVal([FromQuery] string value)
        {
            return Ok(await this.BiddingService.SetVal(value));
        }

        [HttpDelete]
        [Route("remove-val")]
        public async Task<ActionResult<bool>> RemoveVal([FromQuery] string key)
        {
            return Ok(await this.BiddingService.RemoveVal(key));
        }

        #endregion

    }
}
