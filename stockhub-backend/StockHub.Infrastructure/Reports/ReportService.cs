using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using StockHub.Application.Common.Interfaces;
using StockHub.Domain.Enums;
using StockHub.Infrastructure.Data;

namespace StockHub.Infrastructure.Reports;

public class ReportService(ApplicationDbContext context, ICurrentUserService currentUser) : IReportService
{
    public async Task<byte[]> GenerateStockReportAsync(CancellationToken ct = default)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        // Load all products with includes
        var products = await context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Unit)
            .Where(p => p.IsActive)
            .ToListAsync(ct);

        // Load all stock
        var stockDict = await context.StockMovements
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

        // Build report items in memory
        var reportItems = products.Select(p =>
        {
            var stock = stockDict.GetValueOrDefault(p.Id, 0);
            return new StockReportItem(
                p.Name, p.SKU, p.Category.Name,
                stock, p.Unit.Symbol,
                p.CostPrice, stock * p.CostPrice,
                stock <= p.ReorderLevel
            );
        }).ToList();

        var generatedBy = currentUser.Username ?? "System";
        var document = new StockReportDocument(reportItems, generatedBy);

        return document.GeneratePdf();
    }
}
