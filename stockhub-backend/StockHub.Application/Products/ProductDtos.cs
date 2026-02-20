namespace StockHub.Application.Products;

public record CreateProductRequest(
    string Name,
    string SKU,
    string? Description,
    decimal CostPrice,
    decimal SellingPrice,
    int ReorderLevel,
    int CategoryId,
    int UnitId
);

public record UpdateProductRequest(
    string Name,
    string? Description,
    decimal CostPrice,
    decimal SellingPrice,
    int ReorderLevel,
    int CategoryId,
    int UnitId
);

public record ProductResponse(
    int Id,
    string Name,
    string SKU,
    string? Description,
    decimal CostPrice,
    decimal SellingPrice,
    int ReorderLevel,
    string CategoryName,
    string UnitName,
    string UnitSymbol,
    decimal CurrentStock,
    bool IsLowStock,
    bool IsActive
);
