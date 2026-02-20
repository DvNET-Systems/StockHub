using Microsoft.EntityFrameworkCore;
using StockHub.Application.Common.Interfaces;
using StockHub.Domain.Entities;
using StockHub.Domain.Exceptions;

namespace StockHub.Application.Auth;

public class AuthService(IApplicationDbContext context, IJwtTokenGenerator jwtGenerator) : IAuthService
{
    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Username == request.Username && u.IsActive, ct)
            ?? throw new NotFoundException("Invalid username or password.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new BusinessException("Invalid username or password.");

        return new AuthResponse(user.Id, user.Username, user.Email, jwtGenerator.GenerateToken(user));
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        if (await context.Users.AnyAsync(u => u.Username == request.Username, ct))
            throw new ConflictException($"Username '{request.Username}' is already taken.");

        if (await context.Users.AnyAsync(u => u.Email == request.Email, ct))
            throw new ConflictException($"Email '{request.Email}' is already in use.");

        var user = new AppUser
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        context.Users.Add(user);
        await context.SaveChangesAsync(ct);

        return new AuthResponse(user.Id, user.Username, user.Email, jwtGenerator.GenerateToken(user));
    }
}
