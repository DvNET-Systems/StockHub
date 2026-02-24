using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockHub.Application.Suppliers;

namespace StockHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SuppliersController(ISupplierService supplierService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await supplierService.GetAllAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
        => Ok(await supplierService.GetByIdAsync(id, ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSupplierRequest request, CancellationToken ct)
    {
        var supplier = await supplierService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = supplier.Id }, supplier);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSupplierRequest request, CancellationToken ct)
        => Ok(await supplierService.UpdateAsync(id, request, ct));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await supplierService.DeleteAsync(id, ct);
        return NoContent();
    }
}
