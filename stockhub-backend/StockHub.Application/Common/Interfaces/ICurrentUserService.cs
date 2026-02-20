namespace StockHub.Application.Common.Interfaces;

public interface ICurrentUserService
{
    string? UserId {get; set;}
    string? Username {get; set;}
}
