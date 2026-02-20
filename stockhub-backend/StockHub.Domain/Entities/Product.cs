namespace StockHub.Domain.Entities;

public class Product : BaseEntity
{
    public required string Name { get; set; }
    public required string SKU { get; set; }
    public string? Description { get; set; }
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public int ReorderLevel { get; set; } = 10;
    public bool IsActive { get; set; } = true;
    
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    
    public int UnitId { get; set; }
    public Unit Unit { get; set; } = null!;

    public ICollection<StockMovement> StockMovements { get; set; } = [];
    public ICollection<PurchaseItem> PurchaseItems { get; set; } = [];
    public ICollection<SaleItem> SaleItems { get; set; } = [];
}
