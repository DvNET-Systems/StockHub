using Microsoft.EntityFrameworkCore;
using StockHub.Application.Common.Interfaces;
using StockHub.Domain.Entities;
using StockHub.Domain.Exceptions;

namespace StockHub.Application.Customers;

public class CustomerService(IApplicationDbContext context) : ICustomerService
{
    public async Task<List<CustomerResponse>> GetAllAsync(CancellationToken ct = default)
    {
        var customers = await context.Customers
            .AsNoTracking()
            .Where(c => c.IsActive)
            .ToListAsync(ct);
        return customers.Select(MapToResponse).ToList();
    }

    public async Task<CustomerResponse> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var customer = await context.Customers
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException($"Customer {id} not found.");
        return MapToResponse(customer);
    }

    public async Task<CustomerResponse> CreateAsync(CreateCustomerRequest request, CancellationToken ct = default)
    {
        var customer = new Customer
        {
            Name = request.Name, Phone = request.Phone,
            Email = request.Email, Address = request.Address
        };
        context.Customers.Add(customer);
        await context.SaveChangesAsync(ct);
        return MapToResponse(customer);
    }

    public async Task<CustomerResponse> UpdateAsync(int id, UpdateCustomerRequest request, CancellationToken ct = default)
    {
        var customer = await context.Customers
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException($"Customer {id} not found.");

        customer.Name = request.Name;
        customer.Phone = request.Phone;
        customer.Email = request.Email;
        customer.Address = request.Address;
        customer.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(ct);
        return MapToResponse(customer);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var customer = await context.Customers
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException($"Customer {id} not found.");

        customer.IsActive = false;
        customer.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(ct);
    }

    private static CustomerResponse MapToResponse(Customer c) =>
        new(c.Id, c.Name, c.Phone, c.Email, c.Address, c.IsActive);
}
