using Microsoft.EntityFrameworkCore;
using StockHub.Application.Common.Interfaces;
using StockHub.Domain.Entities;
using StockHub.Domain.Enums;
using StockHub.Domain.Exceptions;

namespace StockHub.Application.PurchaseOrders;

public class PurchaseOrderService(IApplicationDbContext context) : IPurchaseOrderService
{
    public async Task<List<PurchaseOrderResponse>> GetAllAsync(CancellationToken ct = default)
    {
        var orders = await context.PurchaseOrders
            .AsNoTracking()
            .Include(o => o.Supplier)
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync(ct);

        return orders.Select(MapToResponse).ToList();
    }

    public async Task<PurchaseOrderResponse> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var order = await context.PurchaseOrders
            .AsNoTracking()
            .Include(o => o.Supplier)
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == id, ct)
            ?? throw new NotFoundException($"Purchase Order {id} not found.");

        return MapToResponse(order);
    }

    public async Task<PurchaseOrderResponse> CreateAsync(CreatePurchaseOrderRequest request, CancellationToken ct = default)
    {
        var supplierExists = await context.Suppliers
            .AnyAsync(s => s.Id == request.SupplierId && s.IsActive, ct);
        if (!supplierExists)
            throw new NotFoundException($"Supplier {request.SupplierId} not found.");

        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var foundProducts = await context.Products
            .Where(p => productIds.Contains(p.Id) && p.IsActive)
            .Select(p => p.Id)
            .ToListAsync(ct);

        var missing = productIds.Except(foundProducts).ToList();
        if (missing.Count > 0)
            throw new NotFoundException($"Products not found: {string.Join(", ", missing)}");

        var order = new PurchaseOrder
        {
            SupplierId = request.SupplierId,
            OrderNumber = GenerateOrderNumber("PO"),
            Notes = request.Notes,
            Items = request.Items.Select(i => new PurchaseItem
            {
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                UnitCost = i.UnitCost
            }).ToList()
        };

        order.TotalAmount = order.Items.Sum(i => i.Quantity * i.UnitCost);

        context.PurchaseOrders.Add(order);
        await context.SaveChangesAsync(ct);

        return await GetByIdAsync(order.Id, ct);
    }

    public async Task<PurchaseOrderResponse> ConfirmAsync(int id, CancellationToken ct = default)
    {
        var order = await context.PurchaseOrders
            .FirstOrDefaultAsync(o => o.Id == id, ct)
            ?? throw new NotFoundException($"Purchase Order {id} not found.");

        if (order.Status != OrderStatus.Draft)
            throw new BusinessException($"Only Draft orders can be confirmed. Current status: {order.Status}");

        order.Status = OrderStatus.Confirmed;
        order.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(ct);

        return await GetByIdAsync(id, ct);
    }

    public async Task<PurchaseOrderResponse> CompleteAsync(int id, CancellationToken ct = default)
    {
        var order = await context.PurchaseOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, ct)
            ?? throw new NotFoundException($"Purchase Order {id} not found.");

        if (order.Status != OrderStatus.Confirmed)
            throw new BusinessException("Only Confirmed orders can be completed.");

        var movements = order.Items.Select(item => new StockMovement
        {
            ProductId = item.ProductId,
            Type = StockMovementType.In,
            Quantity = item.Quantity,
            ReferenceId = order.Id,
            ReferenceType = "Purchase",
            Notes = $"Purchase Order #{order.OrderNumber}"
        }).ToList();

        context.StockMovements.AddRange(movements);

        order.Status = OrderStatus.Completed;
        order.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(ct);
        return await GetByIdAsync(id, ct);
    }

    public async Task CancelAsync(int id, CancellationToken ct = default)
    {
        var order = await context.PurchaseOrders
            .FirstOrDefaultAsync(o => o.Id == id, ct)
            ?? throw new NotFoundException($"Purchase Order {id} not found.");

        if (order.Status == OrderStatus.Completed)
            throw new BusinessException("Cannot cancel a completed order.");

        order.Status = OrderStatus.Cancelled;
        order.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(ct);
    }

    private static string GenerateOrderNumber(string prefix)
        => $"{prefix}-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

    private static PurchaseOrderResponse MapToResponse(PurchaseOrder o) =>
        new(o.Id, o.OrderNumber, o.SupplierId, o.Supplier.Name,
            o.OrderDate, o.Status, o.TotalAmount, o.Notes,
            o.Items.Select(i => new PurchaseItemResponse(
                i.Id, i.ProductId, i.Product.Name, i.Product.SKU,
                i.Quantity, i.UnitCost, i.Quantity * i.UnitCost
            )).ToList());
}
