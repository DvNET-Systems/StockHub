using Microsoft.EntityFrameworkCore;
using StockHub.Application.Common.Interfaces;
using StockHub.Domain.Entities;
using StockHub.Domain.Exceptions;

namespace StockHub.Application.Categories;

public class CategoryService(IApplicationDbContext context) : ICategoryService
{
    public async Task<List<CategoryResponse>> GetAllAsync(CancellationToken ct = default)
    {
        var categories = await context.Categories
            .AsNoTracking()
            .Include(c => c.Products)
            .Where(c => c.IsActive)
            .ToListAsync(ct);

        return categories.Select(c => new CategoryResponse(
            c.Id, c.Name, c.Description,
            c.Products.Count(p => p.IsActive), c.IsActive
        )).ToList();
    }

    public async Task<CategoryResponse> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var category = await context.Categories
            .AsNoTracking()
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException($"Category {id} not found.");

        return new CategoryResponse(
            category.Id, category.Name, category.Description,
            category.Products.Count(p => p.IsActive), category.IsActive
        );
    }

    public async Task<CategoryResponse> CreateAsync(CreateCategoryRequest request, CancellationToken ct = default)
    {
        if (await context.Categories.AnyAsync(c => c.Name == request.Name, ct))
            throw new ConflictException($"Category '{request.Name}' already exists.");

        var category = new Category { Name = request.Name, Description = request.Description };
        context.Categories.Add(category);
        await context.SaveChangesAsync(ct);

        return new CategoryResponse(category.Id, category.Name, category.Description, 0, true);
    }

    public async Task<CategoryResponse> UpdateAsync(int id, UpdateCategoryRequest request, CancellationToken ct = default)
    {
        var category = await context.Categories
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException($"Category {id} not found.");

        category.Name = request.Name;
        category.Description = request.Description;
        category.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(ct);

        return await GetByIdAsync(id, ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var category = await context.Categories
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException($"Category {id} not found.");

        bool hasProducts = await context.Products.AnyAsync(p => p.CategoryId == id && p.IsActive, ct);
        if (hasProducts)
            throw new BusinessException("Cannot delete a category that has active products.");

        category.IsActive = false;
        category.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(ct);
    }
}
