using StockHub.Domain.Enums;

namespace StockHub.Domain.Entities;

public class StockMovement : BaseEntity
{
    public int ProductId {get; set;}
    public Product Product { get; set; } = null!;
    
    public StockMovementType Type { get; set; }
    public decimal Quantity { get; set; }
    
    public string? Notes { get; set; }
    public int? ReferenceId { get; set; }
    public string? ReferenceType { get; set; }
    
    public DateTime MovementDate { get; set; } =  DateTime.UtcNow;
}
