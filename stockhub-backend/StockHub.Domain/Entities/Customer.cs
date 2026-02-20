namespace StockHub.Domain.Entities;

public class Customer: BaseEntity
{
    public required string Name { get; set; }
    public string? Contact { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public ICollection<SaleOrder> SaleOrders { get; set; } = new List<SaleOrder>();
}