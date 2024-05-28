using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Auction.Server.Migrations
{
    /// <inheritdoc />
    public partial class v5 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Validated",
                table: "User");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Validated",
                table: "User",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
