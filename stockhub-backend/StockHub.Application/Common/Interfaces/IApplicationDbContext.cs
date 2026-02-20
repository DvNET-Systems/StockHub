using Microsoft.EntityFrameworkCore;
using StockHub.Domain.Entities;

namespace StockHub.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<AppUser> Users { get; }
    DbSet<Category> Categories { get; }
    DbSet<Customer> Customers { get; }
    DbSet<Product> Products { get; }
    DbSet<PurchaseItem> PurchaseItems { get; }
    DbSet<PurchaseOrder> PurchaseOrders { get; }
    DbSet<SaleItem> SaleItems { get; }
    DbSet<SaleOrder> SaleOrders { get; }
    DbSet<StockMovement> StockMovements { get; }
    DbSet<Supplier> Suppliers { get; }
    DbSet<Unit> Units { get; }
    
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}