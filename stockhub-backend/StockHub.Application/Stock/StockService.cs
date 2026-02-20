using Microsoft.EntityFrameworkCore;
using StockHub.Application.Common.Interfaces;
using StockHub.Domain.Entities;
using StockHub.Domain.Enums;
using StockHub.Domain.Exceptions;

namespace StockHub.Application.Stock;

public class StockService(IApplicationDbContext context) : IStockService
{
    public async Task<List<StockMovementResponse>> GetMovementsAsync(int? productId = null, CancellationToken ct = default)
    {
        var query = context.StockMovements
            .AsNoTracking()
            .Include(m => m.Product);

        var movements = productId.HasValue
            ? await query.Where(m => m.ProductId == productId.Value).ToListAsync(ct)
            : await query.OrderByDescending(m => m.MovementDate).Take(200).ToListAsync(ct);

        return movements.Select(MapToResponse).ToList();
    }

    public async Task<StockMovementResponse> AdjustAsync(AdjustStockRequest request, CancellationToken ct = default)
    {
        var product = await context.Products
            .FirstOrDefaultAsync(p => p.Id == request.ProductId && p.IsActive, ct)
            ?? throw new NotFoundException($"Product {request.ProductId} not found.");

        if (request.Type == StockMovementType.Out)
        {
            var currentStock = await GetCurrentStockAsync(request.ProductId, ct);
            if (currentStock < request.Quantity)
                throw new BusinessException($"Insufficient stock. Current: {currentStock}, Requested: {request.Quantity}");
        }

        var movement = new StockMovement
        {
            ProductId = request.ProductId,
            Type = request.Type,
            Quantity = request.Quantity,
            Notes = request.Notes,
            ReferenceType = "Adjustment"
        };

        context.StockMovements.Add(movement);
        await context.SaveChangesAsync(ct);

        movement.Product = product;
        return MapToResponse(movement);
    }

    public async Task<decimal> GetCurrentStockAsync(int productId, CancellationToken ct = default)
    {
        var hasMovements = await context.StockMovements
            .AnyAsync(m => m.ProductId == productId, ct);

        if (!hasMovements) return 0;

        return await context.StockMovements
            .Where(m => m.ProductId == productId)
            .SumAsync(m => m.Type == StockMovementType.In
                ? m.Quantity
                : m.Type == StockMovementType.Out
                    ? -m.Quantity
                    : m.Quantity, ct);
    }

    private static StockMovementResponse MapToResponse(StockMovement m) =>
        new(m.Id, m.ProductId, m.Product.Name, m.Product.SKU,
            m.Type, m.Quantity, m.Notes, m.ReferenceType, m.MovementDate);
}
