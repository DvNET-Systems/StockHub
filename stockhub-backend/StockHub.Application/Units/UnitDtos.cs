namespace StockHub.Application.Units;

public record CreateUnitRequest(string Name, string Symbol);
public record UnitResponse(int Id, string Name, string Symbol);
