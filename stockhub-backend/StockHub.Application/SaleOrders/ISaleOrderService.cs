namespace StockHub.Application.SaleOrders;

public interface ISaleOrderService
{
    Task<List<SaleOrderResponse>> GetAllAsync(CancellationToken ct = default);
    Task<SaleOrderResponse> GetByIdAsync(int id, CancellationToken ct = default);
    Task<SaleOrderResponse> CreateAsync(CreateSaleOrderRequest request, CancellationToken ct = default);
    Task<SaleOrderResponse> ConfirmAsync(int id, CancellationToken ct = default);
    Task<SaleOrderResponse> CompleteAsync(int id, CancellationToken ct = default);
    Task CancelAsync(int id, CancellationToken ct = default);
}
