using Microsoft.EntityFrameworkCore;
using StockHub.Application.Common.Interfaces;
using StockHub.Domain.Entities;
using StockHub.Domain.Exceptions;

namespace StockHub.Application.Units;

public class UnitService(IApplicationDbContext context) : IUnitService
{
    public async Task<List<UnitResponse>> GetAllAsync(CancellationToken ct = default)
    {
        var units = await context.Units.AsNoTracking().ToListAsync(ct);
        return units.Select(u => new UnitResponse(u.Id, u.Name, u.Symbol)).ToList();
    }

    public async Task<UnitResponse> CreateAsync(CreateUnitRequest request, CancellationToken ct = default)
    {
        if (await context.Units.AnyAsync(u => u.Symbol == request.Symbol, ct))
            throw new ConflictException($"Unit with symbol '{request.Symbol}' already exists.");

        var unit = new Unit { Name = request.Name, Symbol = request.Symbol };
        context.Units.Add(unit);
        await context.SaveChangesAsync(ct);

        return new UnitResponse(unit.Id, unit.Name, unit.Symbol);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var unit = await context.Units
            .FirstOrDefaultAsync(u => u.Id == id, ct)
            ?? throw new NotFoundException($"Unit {id} not found.");

        bool inUse = await context.Products.AnyAsync(p => p.UnitId == id, ct);
        if (inUse) throw new BusinessException("Unit is in use by products.");

        context.Units.Remove(unit);
        await context.SaveChangesAsync(ct);
    }
}
