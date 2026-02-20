namespace StockHub.Domain.Entities;

public class AppUser : BaseEntity
{
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public string Role { get; set; } = "Admin";
    public bool IsActive { get; set; } = true;
}
