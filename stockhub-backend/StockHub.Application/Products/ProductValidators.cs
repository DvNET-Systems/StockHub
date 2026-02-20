using FluentValidation;

namespace StockHub.Application.Products;

public class CreateProductValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().MaximumLength(200);

        RuleFor(x => x.SKU)
            .NotEmpty().MaximumLength(50);

        RuleFor(x => x.CostPrice)
            .GreaterThan(0).WithMessage("Cost price must be greater than 0.");

        RuleFor(x => x.SellingPrice)
            .GreaterThan(0)
            .GreaterThanOrEqualTo(x => x.CostPrice)
            .WithMessage("Selling price must be >= cost price.");

        RuleFor(x => x.ReorderLevel)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.CategoryId).GreaterThan(0);
        RuleFor(x => x.UnitId).GreaterThan(0);
    }
}

public class UpdateProductValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.CostPrice).GreaterThan(0);
        RuleFor(x => x.SellingPrice)
            .GreaterThan(0)
            .GreaterThanOrEqualTo(x => x.CostPrice);
        RuleFor(x => x.ReorderLevel).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CategoryId).GreaterThan(0);
        RuleFor(x => x.UnitId).GreaterThan(0);
    }
}
