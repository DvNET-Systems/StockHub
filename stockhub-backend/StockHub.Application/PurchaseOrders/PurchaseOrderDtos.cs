using StockHub.Domain.Enums;

namespace StockHub.Application.PurchaseOrders;

public record CreatePurchaseOrderRequest(
    int SupplierId,
    string? Notes,
    List<CreatePurchaseItemRequest> Items
);

public record CreatePurchaseItemRequest(
    int ProductId,
    decimal Quantity,
    decimal UnitCost
);

public record PurchaseOrderResponse(
    int Id,
    string OrderNumber,
    int SupplierId,
    string SupplierName,
    DateTime OrderDate,
    OrderStatus Status,
    decimal TotalAmount,
    string? Notes,
    List<PurchaseItemResponse> Items
);

public record PurchaseItemResponse(
    int Id,
    int ProductId,
    string ProductName,
    string ProductSKU,
    decimal Quantity,
    decimal UnitCost,
    decimal TotalCost
);
