namespace StockHub.Application.Stock;

public interface IStockService
{
    Task<List<StockMovementResponse>> GetMovementsAsync(int? productId = null, CancellationToken ct = default);
    Task<StockMovementResponse> AdjustAsync(AdjustStockRequest request, CancellationToken ct = default);
    Task<decimal> GetCurrentStockAsync(int productId, CancellationToken ct = default);
}
