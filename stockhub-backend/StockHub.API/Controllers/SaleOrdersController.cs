using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockHub.Application.SaleOrders;

namespace StockHub.API.Controllers;

[ApiController]
[Route("api/sale-orders")]
[Authorize]
public class SaleOrdersController(
    ISaleOrderService saleOrderService,
    IValidator<CreateSaleOrderRequest> validator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await saleOrderService.GetAllAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
        => Ok(await saleOrderService.GetByIdAsync(id, ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSaleOrderRequest request, CancellationToken ct)
    {
        await validator.ValidateAndThrowAsync(request, ct);
        var order = await saleOrderService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
    }

    [HttpPost("{id:int}/confirm")]
    public async Task<IActionResult> Confirm(int id, CancellationToken ct)
        => Ok(await saleOrderService.ConfirmAsync(id, ct));

    [HttpPost("{id:int}/complete")]
    public async Task<IActionResult> Complete(int id, CancellationToken ct)
        => Ok(await saleOrderService.CompleteAsync(id, ct));

    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id, CancellationToken ct)
    {
        await saleOrderService.CancelAsync(id, ct);
        return NoContent();
    }
}
