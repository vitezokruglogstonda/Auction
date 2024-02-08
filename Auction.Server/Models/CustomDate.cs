namespace Auction.Server.Models
{
    public class CustomDate
    {
        public CustomDate() { }
        public CustomDate(string str)
        {
            string[] strings = str.Split('/');
            this.Day = int.Parse(strings[0]);
            this.Month = int.Parse(strings[1]);
            this.Year = int.Parse(strings[2]);
        }
        public int Day { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
    }
}
