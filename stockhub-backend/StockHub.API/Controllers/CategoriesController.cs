using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockHub.Application.Categories;

namespace StockHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController(ICategoryService categoryService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await categoryService.GetAllAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
        => Ok(await categoryService.GetByIdAsync(id, ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryRequest request, CancellationToken ct)
    {
        var category = await categoryService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryRequest request, CancellationToken ct)
        => Ok(await categoryService.UpdateAsync(id, request, ct));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await categoryService.DeleteAsync(id, ct);
        return NoContent();
    }
}
