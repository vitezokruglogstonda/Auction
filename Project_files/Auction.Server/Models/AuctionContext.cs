using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Security.AccessControl;

namespace Auction.Server.Models
{
    public class AuctionContext : DbContext
    {
        public AuctionContext(DbContextOptions<AuctionContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }

        public DbSet<Article> Articles { get; set; }

        public DbSet<ArticlePicture> ArticlePictures { get; set; }

        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder
                .Entity<User>()
                .Property(u => u.BirthDate)
                .HasConversion(new ValueConverter<CustomDate, string>(
                v => ConvertDateToString(v),
                v => new CustomDate(v)));

            modelBuilder.Entity<Article>()
                .HasOne(a => a.Creator)
                .WithMany(u => u.CreatedArticles)
                .HasForeignKey(a => a.CreatorId)
                .OnDelete(DeleteBehavior.Restrict); 

            modelBuilder.Entity<Article>()
                .HasOne(a => a.Customer)
                .WithMany(u => u.BoughtArticles)
                .HasForeignKey(a => a.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ArticlePicture>()
                .HasOne(a => a.Article)
                .WithMany(u => u.Pictures)
                .HasForeignKey(a => a.ArticleId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
                .Property(u => u.PasswordSalt)
                .HasColumnName("Password Salt")
                .HasColumnType("bytea")
                .IsRequired();

            modelBuilder
                .Entity<Article>()
                .Property(u => u.ExpiryDate)
                .HasConversion(new ValueConverter<CustomDateTime, string>(
                v => ConvertDateTimeToString(v),
                v => new CustomDateTime(v)));

            modelBuilder
                .Entity<Notification>()
                .Property(u => u.Timestamp)
                .HasConversion(new ValueConverter<CustomDateTime, string>(
                v => ConvertDateTimeToString(v),
                v => new CustomDateTime(v)));

            modelBuilder
                .Entity<Notification>()
                .Property(u => u.EndDate)
                .HasConversion(new ValueConverter<CustomDateTime?, string>(
                v => ConvertDateTimeToString(v),
                v => new CustomDateTime(v)));

            base.OnModelCreating(modelBuilder);
        }

        private string ConvertDateToString(CustomDate? customDate)
        {
            string returnDate = customDate?.Day.ToString() + "/" + customDate?.Month.ToString() + "/" + customDate?.Year.ToString();
            return returnDate;
        }

        private string ConvertDateTimeToString(CustomDateTime? customDatetime)
        {
            if(customDatetime == null) 
            {
                customDatetime = new CustomDateTime()
                {
                    Second = 0,
                    Minute = 0,
                    Hour = 0,
                    Day = 0,
                    Month = 0,
                    Year = 0
                };
            }
            string returnDate = customDatetime?.Hour.ToString() + ":" + customDatetime?.Minute.ToString() + ":" + customDatetime?.Second.ToString() + "|" + customDatetime?.Day.ToString() + "/" + customDatetime?.Month.ToString() + "/" + customDatetime?.Year.ToString();
            return returnDate;
        }

    }
}
