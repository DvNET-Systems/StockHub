using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockHub.Application.PurchaseOrders;

namespace StockHub.API.Controllers;

[ApiController]
[Route("api/purchase-orders")]
[Authorize]
public class PurchaseOrdersController(
    IPurchaseOrderService purchaseOrderService,
    IValidator<CreatePurchaseOrderRequest> validator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await purchaseOrderService.GetAllAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
        => Ok(await purchaseOrderService.GetByIdAsync(id, ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePurchaseOrderRequest request, CancellationToken ct)
    {
        await validator.ValidateAndThrowAsync(request, ct);
        var order = await purchaseOrderService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
    }

    [HttpPost("{id:int}/confirm")]
    public async Task<IActionResult> Confirm(int id, CancellationToken ct)
        => Ok(await purchaseOrderService.ConfirmAsync(id, ct));

    [HttpPost("{id:int}/complete")]
    public async Task<IActionResult> Complete(int id, CancellationToken ct)
        => Ok(await purchaseOrderService.CompleteAsync(id, ct));

    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id, CancellationToken ct)
    {
        await purchaseOrderService.CancelAsync(id, ct);
        return NoContent();
    }
}
