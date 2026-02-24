using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockHub.Application.Units;

namespace StockHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UnitsController(IUnitService unitService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await unitService.GetAllAsync(ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUnitRequest request, CancellationToken ct)
    {
        var unit = await unitService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetAll), new { id = unit.Id }, unit);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await unitService.DeleteAsync(id, ct);
        return NoContent();
    }
}
