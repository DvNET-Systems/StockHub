using Microsoft.EntityFrameworkCore;
using StockHub.Application.Common.Interfaces;
using StockHub.Domain.Entities;
using StockHub.Domain.Enums;
using StockHub.Domain.Exceptions;

namespace StockHub.Application.Products;

public class ProductService(IApplicationDbContext context) : IProductService
{
    public async Task<List<ProductResponse>> GetAllAsync(CancellationToken ct = default)
    {
        var products = await context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Unit)
            .Where(p => p.IsActive)
            .ToListAsync(ct);

        var stockDict = await GetStockDictionaryAsync(ct);

        return products.Select(p => MapToResponse(p, stockDict)).ToList();
    }

    public async Task<ProductResponse> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var product = await context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Unit)
            .FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException($"Product with ID {id} not found.");

        var stockDict = await GetStockDictionaryForProductAsync(id, ct);
        return MapToResponse(product, stockDict);
    }

    public async Task<List<ProductResponse>> GetLowStockAsync(CancellationToken ct = default)
    {
        var all = await GetAllAsync(ct);
        return all.Where(p => p.IsLowStock).ToList();
    }

    public async Task<ProductResponse> CreateAsync(CreateProductRequest request, CancellationToken ct = default)
    {
        if (await context.Products.AnyAsync(p => p.SKU == request.Sku, ct))
            throw new ConflictException($"SKU '{request.Sku}' already exists.");

        var product = new Product
        {
            Name = request.Name,
            SKU = request.Sku,
            Description = request.Description,
            CostPrice = request.CostPrice,
            SellingPrice = request.SellingPrice,
            ReorderLevel = request.ReorderLevel,
            CategoryId = request.CategoryId,
            UnitId = request.UnitId
        };

        context.Products.Add(product);
        await context.SaveChangesAsync(ct);

        return await GetByIdAsync(product.Id, ct);
    }

    public async Task<ProductResponse> UpdateAsync(int id, UpdateProductRequest request, CancellationToken ct = default)
    {
        var product = await context.Products
            .FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException($"Product with ID {id} not found.");

        product.Name = request.Name;
        product.Description = request.Description;
        product.CostPrice = request.CostPrice;
        product.SellingPrice = request.SellingPrice;
        product.ReorderLevel = request.ReorderLevel;
        product.CategoryId = request.CategoryId;
        product.UnitId = request.UnitId;
        product.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(ct);
        return await GetByIdAsync(id, ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var product = await context.Products
            .FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException($"Product with ID {id} not found.");

        bool hasMovements = await context.StockMovements
            .AnyAsync(m => m.ProductId == id, ct);

        // Soft delete if has history, hard delete if brand new
        if (hasMovements)
        {
            product.IsActive = false;
            product.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            context.Products.Remove(product);
        }

        await context.SaveChangesAsync(ct);
    }

    // ----- Private helpers -----

    private async Task<Dictionary<int, decimal>> GetStockDictionaryAsync(CancellationToken ct)
    {
        return await context.StockMovements
            .GroupBy(m => m.ProductId)
            .Select(g => new
            {
                ProductId = g.Key,
                Stock = g.Sum(m => m.Type == StockMovementType.In
                    ? m.Quantity
                    : m.Type == StockMovementType.Out
                        ? -m.Quantity
                        : m.Quantity)
            })
            .ToDictionaryAsync(x => x.ProductId, x => x.Stock, ct);
    }

    private async Task<Dictionary<int, decimal>> GetStockDictionaryForProductAsync(int productId, CancellationToken ct)
    {
        var stock = await context.StockMovements
            .Where(m => m.ProductId == productId)
            .SumAsync(m => m.Type == StockMovementType.In
                ? m.Quantity
                : m.Type == StockMovementType.Out
                    ? -m.Quantity
                    : m.Quantity, ct);

        return new Dictionary<int, decimal> { [productId] = stock };
    }

    private static ProductResponse MapToResponse(Product p, Dictionary<int, decimal> stockDict)
    {
        var stock = stockDict.GetValueOrDefault(p.Id, 0);
        return new ProductResponse(
            p.Id, p.Name, p.SKU, p.Description,
            p.CostPrice, p.SellingPrice, p.ReorderLevel,
            p.Category.Name, p.Unit.Name, p.Unit.Symbol,
            stock, stock <= p.ReorderLevel, p.IsActive
        );
    }
}
