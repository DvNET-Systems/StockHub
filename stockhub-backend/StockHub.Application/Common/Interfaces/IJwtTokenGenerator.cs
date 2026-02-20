using StockHub.Domain.Entities;

namespace StockHub.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(AppUser user);
}
