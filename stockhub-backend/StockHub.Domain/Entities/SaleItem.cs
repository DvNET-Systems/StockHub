namespace StockHub.Domain.Entities;

public class SaleItem : BaseEntity
{
    public int SaleOrderId { get; set; }
    public SaleOrder SaleOrder { get; set; } = null!;
    
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice => Quantity * UnitPrice;
}
