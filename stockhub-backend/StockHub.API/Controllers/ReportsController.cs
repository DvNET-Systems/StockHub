using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockHub.Application.Common.Interfaces;

namespace StockHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController(IReportService reportService) : ControllerBase
{
    [HttpGet("stock-summary")]
    public async Task<IActionResult> StockSummary(CancellationToken ct)
    {
        var pdfBytes = await reportService.GenerateStockReportAsync(ct);
        var fileName = $"StockReport_{DateTime.Now:yyyyMMdd_HHmm}.pdf";
        return File(pdfBytes, "application/pdf", fileName);
    }
    
    [HttpGet("sales-summary")]
    public async Task<IActionResult> SalesReport(CancellationToken ct)
    {
        var pdf = await reportService.GenerateSalesReportAsync(ct);
        return File(pdf, "application/pdf", $"sales-report-{DateTime.UtcNow:yyyyMMdd}.pdf");
    }
}

