using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using StockHub.Application.Auth;
using StockHub.Application.Categories;
using StockHub.Application.Customers;
using StockHub.Application.Products;
using StockHub.Application.PurchaseOrders;
using StockHub.Application.SaleOrders;
using StockHub.Application.Stock;
using StockHub.Application.Suppliers;
using StockHub.Application.Units;

namespace StockHub.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Auto-register all validators from this assembly
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        // Register services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IUnitService, UnitService>();
        services.AddScoped<ISupplierService, SupplierService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<IStockService, StockService>();
        services.AddScoped<IPurchaseOrderService, PurchaseOrderService>();
        services.AddScoped<ISaleOrderService, SaleOrderService>();

        return services;
    }
}
