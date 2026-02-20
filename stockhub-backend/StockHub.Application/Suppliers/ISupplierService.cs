namespace StockHub.Application.Suppliers;

public interface ISupplierService
{
    Task<List<SupplierResponse>> GetAllAsync(CancellationToken ct = default);
    Task<SupplierResponse> GetByIdAsync(int id, CancellationToken ct = default);
    Task<SupplierResponse> CreateAsync(CreateSupplierRequest request, CancellationToken ct = default);
    Task<SupplierResponse> UpdateAsync(int id, UpdateSupplierRequest request, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}
