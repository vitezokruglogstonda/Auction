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

            base.OnModelCreating(modelBuilder);
        }

        private string ConvertDateToString(CustomDate? customDate)
        {
            string returnDate = customDate?.Day.ToString() + "/" + customDate?.Month.ToString() + "/" + customDate?.Year.ToString();
            return returnDate;
        }

    }
}
