# AeroPath

AeroPath is a calmer travel planner for comparing flights, saving options, and organizing stays.

## Requirements

- Node.js 20.19 or newer (Node.js 22 is recommended for Vite 7)
- pnpm 10

## Run The Frontend

```sh
pnpm install
PORT=5173 BASE_PATH=/ pnpm --dir frontend/aeropath run dev
```

If the port is already in use, choose another value such as `PORT=5175`.

## Validate The Frontend

```sh
pnpm --dir frontend/aeropath run typecheck
PORT=5173 BASE_PATH=/ pnpm --dir frontend/aeropath run build
```

## Workspace Commands

```sh
pnpm run typecheck
pnpm run build
pnpm --filter @workspace/api-server run dev
```

The API server requires `PORT`. Database-backed packages additionally require `DATABASE_URL`.

## Project Layout

- `frontend/aeropath` - main AeroPath application
- `frontend/mockup-sandbox` - mockup preview workspace
- `artifacts/api-server` - Express API server
- `lib/api-spec` - OpenAPI contract
- `lib/api-client-react` - generated React API client
- `lib/api-zod` - generated Zod API types
- `lib/db` - Drizzle schema and database client
