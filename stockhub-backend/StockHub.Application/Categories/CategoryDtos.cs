namespace StockHub.Application.Categories;

public record CreateCategoryRequest(string Name, string? Description);
public record UpdateCategoryRequest(string Name, string? Description);
public record CategoryResponse(int Id, string Name, string? Description, int ProductCount, bool IsActive);
