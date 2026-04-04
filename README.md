# Vama Collections

Vama Collections is a full-stack inventory, procurement, billing, and reporting system for a retail workflow. This repository contains a Spring Boot backend, a Next.js frontend, and Docker Compose configuration for running the full stack locally.

## What is in this repo

- `vama-backend`: Spring Boot 3.4 API with PostgreSQL, Flyway migrations, JPA, validation, and Swagger/OpenAPI.
- `vama-frontend`: Next.js 16 app for dashboard, inventory, categories, vendors, purchase orders, sales, customers, reports, and settings.
- `docker-compose.yml`: local orchestration for Postgres, backend, and frontend.

## Core capabilities

- Inventory management for products and categories
- Vendor and purchase order management
- Billing and customer management
- Sales, stock, and GST reporting
- Store settings management

## Tech stack

- Backend: Java 21, Spring Boot, Spring Data JPA, Flyway, PostgreSQL
- Frontend: Next.js, React 19, TypeScript, TanStack Query, TanStack Table
- Local infrastructure: Docker Compose, PostgreSQL 16

## Project structure

```text
.
├── docker-compose.yml
├── vama-backend/
└── vama-frontend/
```

## Run with Docker

This is the fastest way to start the full stack.

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI docs: `http://localhost:8080/api-docs`

## Run locally without Docker

### Prerequisites

- Java 21
- Maven 3.9+
- Node.js 22+
- npm
- PostgreSQL 16

### 1. Start PostgreSQL

Create a database named `vama` and make sure these credentials are available:

- database: `vama`
- username: `vama`
- password: `vama`

The backend reads the following environment variables:

- `DB_URL` default: `jdbc:postgresql://localhost:5432/vama`
- `DB_USERNAME` default: `vama`
- `DB_PASSWORD` default: `vama`
- `PORT` default: `8080`

### 2. Start the backend

```bash
cd vama-backend
mvn spring-boot:run
```

Flyway migrations run on startup.

### 3. Start the frontend

If you want the frontend to call the real backend, set `NEXT_PUBLIC_API_URL`.

```bash
cd vama-frontend
NEXT_PUBLIC_API_URL=http://localhost:8080 npm run dev
```

Frontend app:

- `http://localhost:3000`

## Mock-data behavior

The frontend falls back to mock services when `NEXT_PUBLIC_API_URL` is not set to a real value. This is useful for UI work, but it means the app will not talk to the backend unless you explicitly set the API URL.

## Useful commands

```bash
# backend tests
cd vama-backend
mvn test

# frontend lint
cd vama-frontend
npm run lint

# frontend production build
cd vama-frontend
npm run build
```

## Main backend API areas

- `/api/v1/products`
- `/api/v1/categories`
- `/api/v1/vendors`
- `/api/v1/purchase-orders`
- `/api/v1/bills`
- `/api/v1/customers`
- `/api/v1/reports/gst`
- `/api/v1/reports/stock`
- `/api/v1/settings/store`

## Notes

- Backend schema is managed through Flyway migrations in `vama-backend/src/main/resources/db/migration`.
- Docker Compose passes `NEXT_PUBLIC_API_URL=http://localhost:8080` to the frontend build so the UI targets the local API container setup.
