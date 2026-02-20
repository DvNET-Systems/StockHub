namespace StockHub.Domain.Entities;

public class Unit : BaseEntity
{
    public required string Name { get; set; }
    public required string Symbol { get; set; }
    public ICollection<Product> Products { get; set; } = new List<Product>();
}