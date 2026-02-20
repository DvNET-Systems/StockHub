namespace StockHub.Application.Customers;

public interface ICustomerService
{
    Task<List<CustomerResponse>> GetAllAsync(CancellationToken ct = default);
    Task<CustomerResponse> GetByIdAsync(int id, CancellationToken ct = default);
    Task<CustomerResponse> CreateAsync(CreateCustomerRequest request, CancellationToken ct = default);
    Task<CustomerResponse> UpdateAsync(int id, UpdateCustomerRequest request, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}
