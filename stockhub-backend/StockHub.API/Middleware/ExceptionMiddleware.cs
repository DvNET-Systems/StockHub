using System.Net;
using StockHub.Domain.Exceptions;

namespace StockHub.API.Middleware;

public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, title) = exception switch
        {
            NotFoundException   => (HttpStatusCode.NotFound, "Not Found"),
            ConflictException   => (HttpStatusCode.Conflict, "Conflict"),
            BusinessException   => (HttpStatusCode.UnprocessableEntity, "Business Rule Violation"),
            _                   => (HttpStatusCode.InternalServerError, "Internal Server Error")
        };

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = (int)statusCode;

        return context.Response.WriteAsJsonAsync(new
        {
            type = $"https://httpstatuses.com/{(int)statusCode}",
            title,
            status = (int)statusCode,
            detail = exception.Message,
            instance = context.Request.Path.Value
        });
    }
}
