using Auction.Server.Models;
using Auction.Server.Models.Dto;
using Auction.Server.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace Auction.Server.Hubs
{
    public class NotificationHub : Hub
    {
        private readonly INotificationService NotificationService;

        public NotificationHub(INotificationService notificationService)
        {
            this.NotificationService = notificationService;
        }

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public Task JoinNotificationGroup(int groupId)
        {
            this.NotificationService.GetNotificationList(groupId);
            return Groups.AddToGroupAsync(base.Context.ConnectionId, "n_u_" + groupId.ToString());
        }


        public Task LeaveNotificationGroup(int groupId)
        {
            return Groups.RemoveFromGroupAsync(base.Context.ConnectionId, "n_u_" + groupId.ToString());
        }
    }
}
