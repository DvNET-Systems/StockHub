using Microsoft.OpenApi;

namespace StockHub.API.Extensions;

public static class OpenApiExtensions
{
    public static IServiceCollection AddApiDocumentation(this IServiceCollection services)
    {
        services.AddOpenApi(options =>
        {
            options.AddDocumentTransformer((document, _, _) =>
            {
                document.Info = new OpenApiInfo
                {
                    Title = "StockHub API",
                    Version = "v1",
                    Description = "DvNET StockHub API"
                };

                document.Components ??= new OpenApiComponents();

                document.Components.SecuritySchemes = new Dictionary<string, IOpenApiSecurityScheme>
                {
                    ["Bearer"] = new OpenApiSecurityScheme
                    {
                        Type = SecuritySchemeType.Http,
                        Scheme = "bearer",
                        BearerFormat = "JWT",
                        In = ParameterLocation.Header,
                        Description = "Enter your JWT token directly."
                    }
                };

                return Task.CompletedTask;
            });
        });

        return services;
    }
}
