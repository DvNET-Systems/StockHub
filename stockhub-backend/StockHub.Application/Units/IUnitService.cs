namespace StockHub.Application.Units;

public interface IUnitService
{
    Task<List<UnitResponse>> GetAllAsync(CancellationToken ct = default);
    Task<UnitResponse> CreateAsync(CreateUnitRequest request, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}
