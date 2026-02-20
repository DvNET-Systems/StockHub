using FluentValidation;

namespace StockHub.Application.Stock;

public class AdjustStockValidator : AbstractValidator<AdjustStockRequest>
{
    public AdjustStockValidator()
    {
        RuleFor(x => x.ProductId).GreaterThan(0);
        RuleFor(x => x.Quantity).GreaterThan(0).WithMessage("Quantity must be positive.");
        RuleFor(x => x.Notes).MaximumLength(500);
    }
}
