namespace StockHub.Application.Auth;

public record LoginRequest(string Username, string Password);

public record RegisterRequest(string Username, string Email, string Password);

public record AuthResponse(int UserId, string Username, string Email, string Token);
