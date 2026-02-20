namespace StockHub.Application.PurchaseOrders;

public interface IPurchaseOrderService
{
    Task<List<PurchaseOrderResponse>> GetAllAsync(CancellationToken ct = default);
    Task<PurchaseOrderResponse> GetByIdAsync(int id, CancellationToken ct = default);
    Task<PurchaseOrderResponse> CreateAsync(CreatePurchaseOrderRequest request, CancellationToken ct = default);
    Task<PurchaseOrderResponse> ConfirmAsync(int id, CancellationToken ct = default);
    Task<PurchaseOrderResponse> CompleteAsync(int id, CancellationToken ct = default);
    Task CancelAsync(int id, CancellationToken ct = default);
}
