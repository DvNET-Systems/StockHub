namespace StockHub.Application.Suppliers;

public record CreateSupplierRequest(
    string Name,
    string? ContactPerson,
    string? Phone,
    string? Email,
    string? Address
);

public record UpdateSupplierRequest(
    string Name,
    string? ContactPerson,
    string? Phone,
    string? Email,
    string? Address
);

public record SupplierResponse(
    int Id,
    string Name,
    string? ContactPerson,
    string? Phone,
    string? Email,
    string? Address,
    bool IsActive
);
