using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using StockHub.API.Extensions;
using StockHub.API.Middleware;
using StockHub.Application;
using StockHub.Infrastructure;
using StockHub.Infrastructure.Data;
using StockHub.Infrastructure.Data.Seeder;

var builder = WebApplication.CreateBuilder(args);

// Register services
builder.Services.AddControllers();
builder.Services.AddApiDocumentation();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// Middleware pipeline
app.UseMiddleware<ExceptionMiddleware>();
app.UseMiddleware<ValidationMiddleware>();

app.UseCors();

// OpenAPI and Scalar documentation
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("StockHub API v1")
            .AddPreferredSecuritySchemes("Bearer")
            .WithTheme(ScalarTheme.Kepler)
            .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
    });
}

// Authentication and Authorization
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

// Map controllers
app.MapControllers();

// Database migration and seeding
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await db.Database.MigrateAsync();
    await DbSeeder.SeedAsync(db);
}

app.Run();
