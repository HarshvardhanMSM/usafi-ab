# Usafi Backend Service

Production-ready backend foundation for **Usafi**, built with Node.js, Express.js, TypeScript, PostgreSQL 17, and Prisma ORM.

## Tech Stack

- **Runtime & Framework:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL 17 (Docker Compose)
- **ORM:** Prisma ORM
- **Authentication & Security:** JWT (jsonwebtoken), bcrypt, Helmet, CORS
- **Validation:** Zod
- **Documentation:** Swagger UI / OpenAPI 3.0
- **Testing:** Jest, Supertest
- **Code Quality:** ESLint v9, Prettier

---

## Requirements

- Node.js >= 20.x
- npm >= 10.x
- Docker Desktop / Docker Engine

---

## Project Structure

```
backend/
├── src/
│   ├── config/          # Environment & Database client config
│   ├── controllers/     # Controller layer handlers
│   ├── services/        # Service layer business logic
│   ├── repositories/    # Data access layer
│   ├── routes/          # API route definitions
│   ├── middleware/      # Global & custom Express middlewares
│   ├── validators/      # Zod validation schemas
│   ├── types/           # TypeScript interfaces & types
│   ├── utils/           # Utilities (logger, response, JWT, bcrypt, ApiError)
│   ├── constants/       # Constants & Error codes
│   ├── docs/            # Swagger OpenAPI configuration
│   ├── modules/         # Future feature modules
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Server entrypoint & graceful shutdown
├── prisma/
│   └── schema.prisma    # Prisma schema definition
├── tests/               # Integration and unit tests
├── docker-compose.yml   # PostgreSQL 17 Docker configuration
├── .env                 # Real environment variables (git-ignored)
├── .env.example         # Environment template
├── .gitignore           # Git ignore configuration
├── .prettierrc          # Prettier code formatting rules
├── eslint.config.js     # ESLint configuration
├── tsconfig.json        # TypeScript compiler configuration
├── package.json         # Dependencies and package scripts
└── README.md            # Project documentation
```

---

## First-Time Developer Quickstart

Follow these exact steps to run the backend:

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL 17 container
docker compose up -d

# 3. Generate Prisma Client
npm run prisma:generate

# 4. Apply database migrations
npm run prisma:migrate:dev

# 5. Start development server
npm run dev
```

---

## Environment Variables

Copy `.env.example` to `.env`:

```env
NODE_ENV=development
PORT=5000

POSTGRES_USER=usafi
POSTGRES_PASSWORD=usafi_dev_password
POSTGRES_DB=usafi
POSTGRES_PORT=5434
DATABASE_URL=postgresql://usafi:usafi_dev_password@localhost:5434/usafi?schema=public

JWT_ACCESS_SECRET=usafi_super_secret_access_key_change_in_production_2026
JWT_REFRESH_SECRET=usafi_super_secret_refresh_key_change_in_production_2026
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

ADMIN_FRONTEND_URL=http://localhost:3000
```

---

## Docker PostgreSQL Database Setup

The database runs via Docker Compose on host port **5434** to avoid conflicts with existing local PostgreSQL instances on port 5432.

```bash
# Start container
docker compose up -d

# View container logs
docker compose logs -f postgres

# Stop container
docker compose down
```

---

## Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Validate schema
npm run prisma:validate

# Run migrations (development)
npm run prisma:migrate:dev

# Deploy migrations (production/CI)
npm run prisma:migrate:deploy

# Open Prisma Studio UI
npm run prisma:studio
```

---

## Development Scripts

```bash
# Start development server with live reload
npm run dev

# Run TypeScript type check
npm run typecheck

# Run ESLint check
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

---

## Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## Production Build & Start

```bash
# Compile TypeScript to dist/
npm run build

# Start production server
npm run start
```

---

## API Documentation & Endpoints

- **Swagger UI Interactive Docs:** `http://localhost:5000/api/docs`
- **OpenAPI JSON Spec:** `http://localhost:5000/api/docs.json`
- **Health Check Endpoint:** `GET http://localhost:5000/api/v1/health`
