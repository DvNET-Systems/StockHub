using StockHub.Domain.Enums;

namespace StockHub.Application.SaleOrders;

public record CreateSaleOrderRequest(
    int CustomerId,
    string? Notes,
    List<CreateSaleItemRequest> Items
);

public record CreateSaleItemRequest(
    int ProductId,
    decimal Quantity,
    decimal UnitPrice
);

public record SaleOrderResponse(
    int Id,
    string OrderNumber,
    int CustomerId,
    string CustomerName,
    DateTime OrderDate,
    OrderStatus Status,
    decimal TotalAmount,
    string? Notes,
    List<SaleItemResponse> Items
);

public record SaleItemResponse(
    int Id,
    int ProductId,
    string ProductName,
    string ProductSKU,
    decimal Quantity,
    decimal UnitPrice,
    decimal TotalPrice
);
