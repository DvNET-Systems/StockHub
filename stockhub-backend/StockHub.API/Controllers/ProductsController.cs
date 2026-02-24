using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockHub.Application.Products;

namespace StockHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController(IProductService productService, IValidator<CreateProductRequest> createValidator, IValidator<UpdateProductRequest> updateValidator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await productService.GetAllAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
        => Ok(await productService.GetByIdAsync(id, ct));

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock(CancellationToken ct)
        => Ok(await productService.GetLowStockAsync(ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest request, CancellationToken ct)
    {
        await createValidator.ValidateAndThrowAsync(request, ct);
        var product = await productService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProductRequest request, CancellationToken ct)
    {
        await updateValidator.ValidateAndThrowAsync(request, ct);
        var product = await productService.UpdateAsync(id, request, ct);
        return Ok(product);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await productService.DeleteAsync(id, ct);
        return NoContent();
    }
}
