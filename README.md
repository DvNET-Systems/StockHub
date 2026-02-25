# StockHub

A high-performance inventory management system built with **Clean Architecture**. It handles the full product lifecycle from procurement to sales with automated ledger tracking and PDF reporting.

**Stack:** .NET 10 · React 19 · PostgreSQL 18 · EF Core · TailwindCSS · QuestPDF · JWT

---

## 🚀 Core Functionalities

* **Inventory Ledger:** Every stock change is recorded as a movement (In/Out/Adjustment) for a perfect audit trail.
* **Order Lifecycle:** Complete workflow for Purchase/Sale orders (Draft → Confirm → Complete).
* **Business Logic:** Automatic stock availability checks, SKU tracking, and soft-delete protection.
* **Reporting:** Real-time dashboard analytics and professional PDF generation via QuestPDF.
* **Security:** Role-based access via JWT and BCrypt-hashed credentials.

## 🏗️ Architecture

Following **Clean Architecture** principles to ensure the business logic is independent of frameworks:

* **`.Domain`**: Enterprise logic, Entities, and Enums.
* **`.Application`**: Use cases, DTOs, and Business Validators.
* **`.Infrastructure`**: Persistence (EF Core/PostgreSQL), Identity, and External Services.
* **`.API`**: REST Entry point and Middleware.
* **`stockhub-frontend/`**: Vite-powered React + TypeScript SPA.

---

## 🛠️ Quick Start

**Prerequisites:** .NET 10, Node 25+, and PostgreSQL 18+

### 1. Database Configuration

Update the connection string in `stockhub-backend/StockHub.API/appsettings.Development.json` to match your local PostgreSQL instance:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=StockHubDb;Username=your_user;Password=your_password"
}

```

### 2. Setup & Run

```bash
# Apply migrations to create the database
cd stockhub-backend/StockHub.API
dotnet ef database update --project ../StockHub.Infrastructure

# Start the API
dotnet run

# Start the Frontend
cd stockhub-frontend
npm install
npm run dev

```

> **Default Credentials:** `admin` / `Admin@123`
> **API Docs:** Accessible via **Scalar** at `/scalar` when running in Development.

---

## 💻 Cross-Platform Support

This project is developed on **Arch Linux** and is fully compatible with **Windows** and **macOS**. All .NET and Node.js commands are cross-platform.

---

*Built by **DvNET Systems** · 2026*

