using Microsoft.EntityFrameworkCore;
using StockHub.Domain.Entities;

namespace StockHub.Infrastructure.Data.Seeder;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Only seed if tables are empty
        if (await context.Users.AnyAsync()) return;

        // Default admin user
        context.Users.Add(new AppUser
        {
            Username = "admin",
            Email = "admin@proton.me",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Role = "Admin"
        });

        // Seed units
        var units = new List<Unit>
        {
            new() { Name = "Piece", Symbol = "pcs" },
            new() { Name = "Kilogram", Symbol = "kg" },
            new() { Name = "Litre", Symbol = "L" },
            new() { Name = "Box", Symbol = "box" },
            new() { Name = "Meter", Symbol = "m" }
        };
        context.Units.AddRange(units);

        // Seed categories
        var categories = new List<Category>
        {
            new() { Name = "Electronics", Description = "Electronic devices and components" },
            new() { Name = "Office Supplies", Description = "Stationery and office materials" },
            new() { Name = "Raw Materials", Description = "Manufacturing raw materials" },
            new() { Name = "Finished Goods", Description = "Ready to sell products" }
        };
        context.Categories.AddRange(categories);

        await context.SaveChangesAsync();
    }
}
