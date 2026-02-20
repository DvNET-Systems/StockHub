namespace StockHub.Application.Common.Interfaces;

public interface IReportService
{
    Task<byte[]> GenerateStockReportAsync(CancellationToken ct = default);
}
