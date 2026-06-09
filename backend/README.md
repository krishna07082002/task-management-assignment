# Task Manager — Backend

Node.js + TypeScript + MongoDB REST API for the Task Management Dashboard assignment.

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JWT (Access + Refresh tokens)
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting

## Project Structure

```
src/
├── config/         # DB connection, env config
├── controllers/    # Route handlers (auth, tasks)
├── middleware/     # authenticate, validate, errorHandler
├── models/         # Mongoose models (User, Task)
├── routes/         # Express routers
├── types/          # TypeScript interfaces
├── utils/          # JWT helpers, response helpers
├── validators/     # Zod schemas
├── app.ts          # Express app setup
└── server.ts       # Entry point
```

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Create .env from example
cp .env.example .env
# Fill in MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET

# 3. Dev server (with hot reload)
npm run dev

# 4. Production build
npm run build
npm start
```

## API Endpoints

### Auth
| Method | Endpoint             | Access  | Description       |
|--------|----------------------|---------|-------------------|
| POST   | /api/auth/register   | Public  | Register new user |
| POST   | /api/auth/login      | Public  | Login user        |
| GET    | /api/auth/me         | Private | Get current user  |

### Tasks
| Method | Endpoint          | Access  | Description          |
|--------|-------------------|---------|----------------------|
| GET    | /api/tasks        | Private | List tasks (paginated, filterable) |
| GET    | /api/tasks/stats  | Private | Dashboard stats      |
| GET    | /api/tasks/:id    | Private | Get single task      |
| POST   | /api/tasks        | Private | Create task          |
| PATCH  | /api/tasks/:id    | Private | Update task          |
| DELETE | /api/tasks/:id    | Private | Delete task          |

### Query Params for GET /api/tasks
- `status` — `pending` | `completed`
- `search` — search in title & description
- `page` — page number (default: 1)
- `limit` — items per page (default: 10, max: 50)

## Auth Flow

All protected routes require:
```
Authorization: Bearer <accessToken>
```

Tokens are returned in the login/register response body.

## Architecture Decisions

- **Feature-based structure** — controllers, models, routes grouped by concern
- **Zod validation** — schema validation in middleware before controllers run
- **Static method on User model** — `findByEmail` includes the password field only when needed
- **Compound indexes** on Task — `userId + status` and `userId + createdAt` for efficient queries
- **Rate limiting** — stricter on auth routes (10 req/15min) vs API (100 req/15min)
- **Graceful shutdown** — handles SIGTERM/SIGINT cleanly
