using StockHub.Domain.Enums;

namespace StockHub.Application.Stock;

public record AdjustStockRequest(
    int ProductId,
    StockMovementType Type,
    decimal Quantity,
    string? Notes
);

public record StockMovementResponse(
    int Id,
    int ProductId,
    string ProductName,
    string ProductSKU,
    StockMovementType Type,
    decimal Quantity,
    string? Notes,
    string? ReferenceType,
    DateTime MovementDate
);
