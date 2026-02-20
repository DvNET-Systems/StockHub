namespace StockHub.Domain.Entities;

public class Customer: BaseEntity
{
    public required string Name { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<SaleOrder> SaleOrders { get; set; } = [];
}
