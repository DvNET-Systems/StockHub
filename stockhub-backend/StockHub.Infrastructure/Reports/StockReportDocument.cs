using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace StockHub.Infrastructure.Reports;

public record StockReportItem(
    string ProductName,
    string SKU,
    string Category,
    decimal CurrentStock,
    string Unit,
    decimal CostPrice,
    decimal StockValue,
    bool IsLowStock
);

public class StockReportDocument(List<StockReportItem> items, string generatedBy) : IDocument
{
    public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4.Landscape());
            page.Margin(1.5f, Unit.Centimetre);
            page.DefaultTextStyle(x => x.FontSize(10));

            page.Header().Element(ComposeHeader);
            page.Content().PaddingTop(12).Element(ComposeContent);
            page.Footer().Element(ComposeFooter);
        });
    }

    private void ComposeHeader(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().Row(row =>
            {
                row.RelativeItem().Column(c =>
                {
                    c.Item().Text("StockHub").FontSize(24).Bold().FontColor(Colors.Blue.Darken3);
                    c.Item().Text("Stock Summary Report").FontSize(14).FontColor(Colors.Grey.Darken1);
                });
                row.ConstantItem(200).Column(c =>
                {
                    c.Item().AlignRight().Text($"Generated: {DateTime.Now:dd MMM yyyy HH:mm}").FontSize(9);
                    c.Item().AlignRight().Text($"By: {generatedBy}").FontSize(9);
                });
            });
            col.Item().PaddingTop(8).LineHorizontal(2).LineColor(Colors.Blue.Darken3);
        });
    }

    private void ComposeContent(IContainer container)
    {
        // Summary cards
        container.Column(col =>
        {
            col.Item().Row(row =>
            {
                SummaryCard(row.RelativeItem(), "Total Products", items.Count.ToString(), Colors.Blue.Lighten4);
                SummaryCard(row.RelativeItem(), "Low Stock Items",
                    items.Count(i => i.IsLowStock).ToString(), Colors.Red.Lighten4);
                SummaryCard(row.RelativeItem(), "Total Stock Value",
                    items.Sum(i => i.StockValue).ToString("C2"), Colors.Green.Lighten4);
                SummaryCard(row.RelativeItem(), "Healthy Stock",
                    items.Count(i => !i.IsLowStock).ToString(), Colors.Teal.Lighten4);
            });

            col.Item().PaddingTop(12).Element(ComposeTable);
        });
    }

    private static void SummaryCard(IContainer container, string label, string value, string bgColor)
    {
        container.Padding(4).Background(bgColor).Padding(8).Column(c =>
        {
            c.Item().Text(label).FontSize(9).FontColor(Colors.Grey.Darken2);
            c.Item().Text(value).FontSize(16).Bold();
        });
    }

    private void ComposeTable(IContainer container)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(c =>
            {
                c.RelativeColumn(3);  // Product Name
                c.RelativeColumn(1.5f); // SKU
                c.RelativeColumn(2);  // Category
                c.RelativeColumn(1);  // Unit
                c.RelativeColumn(1);  // Stock
                c.RelativeColumn(1.5f); // Cost Price
                c.RelativeColumn(1.5f); // Stock Value
                c.RelativeColumn(1);  // Status
            });

            // Header row
            table.Header(h =>
            {
                foreach (var col in new[] { "Product", "SKU", "Category", "Unit", "Stock", "Cost Price", "Stock Value", "Status" })
                {
                    h.Cell()
                        .Background(Colors.Blue.Darken3)
                        .Padding(6)
                        .Text(col)
                        .Bold()
                        .FontColor(Colors.White);
                }
            });

            // Data rows
            bool alternate = false;
            foreach (var item in items.OrderBy(i => i.IsLowStock ? 0 : 1).ThenBy(i => i.ProductName))
            {
                string rowBg = alternate ? Colors.Grey.Lighten5 : Colors.White;
                alternate = !alternate;

                TableCell(table, item.ProductName, rowBg);
                TableCell(table, item.SKU, rowBg, fontColor: Colors.Grey.Darken2);
                TableCell(table, item.Category, rowBg);
                TableCell(table, item.Unit, rowBg);
                TableCell(table, item.CurrentStock.ToString("N2"), rowBg,
                    fontColor: item.IsLowStock ? Colors.Red.Medium : Colors.Black);
                TableCell(table, item.CostPrice.ToString("C2"), rowBg);
                TableCell(table, item.StockValue.ToString("C2"), rowBg, bold: true);
                TableCell(table, item.IsLowStock ? "⚠ LOW" : "✓ OK", rowBg,
                    fontColor: item.IsLowStock ? Colors.Red.Medium : Colors.Green.Darken2);
            }
        });
    }

    private static void TableCell(
        TableDescriptor table,
        string text,
        string bg,
        string? fontColor = null,
        bool bold = false)
    {
        var cell = table.Cell()
            .Background(bg)
            .BorderBottom(1)
            .BorderColor(Colors.Grey.Lighten3)
            .Padding(5);

        var textStyle = cell.Text(text);
        if (fontColor != null) textStyle.FontColor(fontColor);
        if (bold) textStyle.Bold();
    }

    private void ComposeFooter(IContainer container)
    {
        container.Row(row =>
        {
            row.RelativeItem()
                .Text($"Total Products: {items.Count} | Low Stock: {items.Count(i => i.IsLowStock)}")
                .FontSize(9).FontColor(Colors.Grey.Darken1);

            row.RelativeItem()
                .AlignCenter()
                .Text(x =>
                {
                    x.Span("Page ").FontSize(9);
                    x.CurrentPageNumber().FontSize(9);
                    x.Span(" of ").FontSize(9);
                    x.TotalPages().FontSize(9);
                });

            row.RelativeItem()
                .AlignRight()
                .Text($"Total Value: {items.Sum(i => i.StockValue):C2}")
                .FontSize(10).Bold();
        });
    }
}
