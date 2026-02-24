using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockHub.Application.Stock;

namespace StockHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StockController(
    IStockService stockService,
    IValidator<AdjustStockRequest> validator) : ControllerBase
{
    [HttpGet("movements")]
    public async Task<IActionResult> GetMovements([FromQuery] int? productId, CancellationToken ct)
        => Ok(await stockService.GetMovementsAsync(productId, ct));

    [HttpGet("{productId:int}/current")]
    public async Task<IActionResult> GetCurrentStock(int productId, CancellationToken ct)
    {
        var stock = await stockService.GetCurrentStockAsync(productId, ct);
        return Ok(new { productId, currentStock = stock });
    }

    [HttpPost("adjust")]
    public async Task<IActionResult> Adjust([FromBody] AdjustStockRequest request, CancellationToken ct)
    {
        await validator.ValidateAndThrowAsync(request, ct);
        var movement = await stockService.AdjustAsync(request, ct);
        return Ok(movement);
    }
}
