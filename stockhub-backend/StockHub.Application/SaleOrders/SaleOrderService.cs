using Microsoft.EntityFrameworkCore;
using StockHub.Application.Common.Interfaces;
using StockHub.Domain.Entities;
using StockHub.Domain.Enums;
using StockHub.Domain.Exceptions;

namespace StockHub.Application.SaleOrders;

public class SaleOrderService(IApplicationDbContext context) : ISaleOrderService
{
    public async Task<List<SaleOrderResponse>> GetAllAsync(CancellationToken ct = default)
    {
        var orders = await context.SaleOrders
            .AsNoTracking()
            .Include(o => o.Customer)
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync(ct);

        return orders.Select(MapToResponse).ToList();
    }

    public async Task<SaleOrderResponse> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var order = await context.SaleOrders
            .AsNoTracking()
            .Include(o => o.Customer)
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == id, ct)
            ?? throw new NotFoundException($"Sale Order {id} not found.");

        return MapToResponse(order);
    }

    public async Task<SaleOrderResponse> CreateAsync(CreateSaleOrderRequest request, CancellationToken ct = default)
    {
        var customerExists = await context.Customers
            .AnyAsync(c => c.Id == request.CustomerId && c.IsActive, ct);
        if (!customerExists)
            throw new NotFoundException($"Customer {request.CustomerId} not found.");

        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await context.Products
            .Where(p => productIds.Contains(p.Id) && p.IsActive)
            .ToListAsync(ct);

        var missing = productIds.Except(products.Select(p => p.Id)).ToList();
        if (missing.Count > 0)
            throw new NotFoundException($"Products not found: {string.Join(", ", missing)}");

        var order = new SaleOrder
        {
            CustomerId = request.CustomerId,
            OrderNumber = GenerateOrderNumber("SO"),
            Notes = request.Notes,
            Items = request.Items.Select(i => new SaleItem
            {
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList()
        };

        order.TotalAmount = order.Items.Sum(i => i.Quantity * i.UnitPrice);

        context.SaleOrders.Add(order);
        await context.SaveChangesAsync(ct);

        return await GetByIdAsync(order.Id, ct);
    }

    public async Task<SaleOrderResponse> ConfirmAsync(int id, CancellationToken ct = default)
    {
        var order = await context.SaleOrders
            .FirstOrDefaultAsync(o => o.Id == id, ct)
            ?? throw new NotFoundException($"Sale Order {id} not found.");

        if (order.Status != OrderStatus.Draft)
            throw new BusinessException($"Only Draft orders can be confirmed.");

        order.Status = OrderStatus.Confirmed;
        order.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(ct);

        return await GetByIdAsync(id, ct);
    }

    public async Task<SaleOrderResponse> CompleteAsync(int id, CancellationToken ct = default)
    {
        var order = await context.SaleOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, ct)
            ?? throw new NotFoundException($"Sale Order {id} not found.");

        if (order.Status != OrderStatus.Confirmed)
            throw new BusinessException("Only Confirmed orders can be completed.");

        // Check stock availability for each item
        foreach (var item in order.Items)
        {
            var stock = await context.StockMovements
                .Where(m => m.ProductId == item.ProductId)
                .SumAsync(m => m.Type == StockMovementType.In
                    ? m.Quantity
                    : m.Type == StockMovementType.Out
                        ? -m.Quantity
                        : m.Quantity, ct);

            if (stock < item.Quantity)
            {
                var product = await context.Products
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.Id == item.ProductId, ct);
                throw new BusinessException(
                    $"Insufficient stock for '{product?.Name}'. Available: {stock}, Required: {item.Quantity}");
            }
        }

        var movements = order.Items.Select(item => new StockMovement
        {
            ProductId = item.ProductId,
            Type = StockMovementType.Out,
            Quantity = item.Quantity,
            ReferenceId = order.Id,
            ReferenceType = "Sale",
            Notes = $"Sale Order #{order.OrderNumber}"
        }).ToList();

        context.StockMovements.AddRange(movements);

        order.Status = OrderStatus.Completed;
        order.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(ct);
        return await GetByIdAsync(id, ct);
    }

    public async Task CancelAsync(int id, CancellationToken ct = default)
    {
        var order = await context.SaleOrders
            .FirstOrDefaultAsync(o => o.Id == id, ct)
            ?? throw new NotFoundException($"Sale Order {id} not found.");

        if (order.Status == OrderStatus.Completed)
            throw new BusinessException("Cannot cancel a completed order.");

        order.Status = OrderStatus.Cancelled;
        order.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(ct);
    }

    private static string GenerateOrderNumber(string prefix)
        => $"{prefix}-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

    private static SaleOrderResponse MapToResponse(SaleOrder o) =>
        new(o.Id, o.OrderNumber, o.CustomerId, o.Customer.Name,
            o.OrderDate, o.Status, o.TotalAmount, o.Notes,
            o.Items.Select(i => new SaleItemResponse(
                i.Id, i.ProductId, i.Product.Name, i.Product.SKU,
                i.Quantity, i.UnitPrice, i.Quantity * i.UnitPrice
            )).ToList());
}
