using Microsoft.EntityFrameworkCore;
using StockHub.Application.Common.Interfaces;
using StockHub.Domain.Entities;
using StockHub.Domain.Exceptions;

namespace StockHub.Application.Suppliers;

public class SupplierService(IApplicationDbContext context) : ISupplierService
{
    public async Task<List<SupplierResponse>> GetAllAsync(CancellationToken ct = default)
    {
        var suppliers = await context.Suppliers
            .AsNoTracking()
            .Where(s => s.IsActive)
            .ToListAsync(ct);

        return suppliers.Select(MapToResponse).ToList();
    }

    public async Task<SupplierResponse> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var supplier = await context.Suppliers
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id, ct)
            ?? throw new NotFoundException($"Supplier {id} not found.");

        return MapToResponse(supplier);
    }

    public async Task<SupplierResponse> CreateAsync(CreateSupplierRequest request, CancellationToken ct = default)
    {
        var supplier = new Supplier
        {
            Name = request.Name,
            ContactPerson = request.ContactPerson,
            Phone = request.Phone,
            Email = request.Email,
            Address = request.Address
        };
        context.Suppliers.Add(supplier);
        await context.SaveChangesAsync(ct);
        return MapToResponse(supplier);
    }

    public async Task<SupplierResponse> UpdateAsync(int id, UpdateSupplierRequest request, CancellationToken ct = default)
    {
        var supplier = await context.Suppliers
            .FirstOrDefaultAsync(s => s.Id == id, ct)
            ?? throw new NotFoundException($"Supplier {id} not found.");

        supplier.Name = request.Name;
        supplier.ContactPerson = request.ContactPerson;
        supplier.Phone = request.Phone;
        supplier.Email = request.Email;
        supplier.Address = request.Address;
        supplier.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(ct);
        return MapToResponse(supplier);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var supplier = await context.Suppliers
            .FirstOrDefaultAsync(s => s.Id == id, ct)
            ?? throw new NotFoundException($"Supplier {id} not found.");

        supplier.IsActive = false;
        supplier.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(ct);
    }

    private static SupplierResponse MapToResponse(Supplier s) =>
        new(s.Id, s.Name, s.ContactPerson, s.Phone, s.Email, s.Address, s.IsActive);
}
