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

    public class CustomDateTime{
        public int Second { get; set; }
        public int Minute { get; set; }
        public int Hour { get; set; }
        public int Day { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public CustomDateTime() { }
        public CustomDateTime(string str)
        {
            string[] parts = str.Split('|');
            string[] time = parts[0].Split(':');
            this.Hour = int.Parse(time[0]);
            this.Minute = int.Parse(time[1]);
            this.Second = int.Parse(time[2]);
            string[] date = parts[1].Split('/');
            this.Day = int.Parse(date[0]);
            this.Month = int.Parse(date[1]);
            this.Year = int.Parse(date[2]);
        }
        public CustomDateTime(DateTime dateTime) 
        {
            this.Hour = dateTime.Hour;
            this.Minute = dateTime.Minute;
            this.Second = dateTime.Second;
            this.Day = dateTime.Day;
            this.Month = dateTime.Month;
            this.Year = dateTime.Year;
        }

        public DateTime ToDateTime()
        {
            return new DateTime(this.Year, this.Month, this.Day, this.Hour, this.Minute, this.Second);
        }
    }
}
