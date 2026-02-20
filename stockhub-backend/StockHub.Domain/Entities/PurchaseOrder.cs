using StockHub.Domain.Enums;

namespace StockHub.Domain.Entities;

public class PurchaseOrder : BaseEntity
{
    public int SupplierId { get; set; }
    public Supplier Supplier { get; set; } = null!;
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public OrderStatus Status { get; set; } = OrderStatus.Draft;
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
    public ICollection<PurchaseItem> PurchaseItems { get; set; } = new List<PurchaseItem>();
}