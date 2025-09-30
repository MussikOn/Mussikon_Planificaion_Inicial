# Mussikon Backend — AI Coding Agent Instructions

## 🏗️ Architecture Overview
- **TypeScript/Node.js API** for connecting musicians and churches
- **Express.js** server (`src/server.ts`) with modular routing (`src/routes/`)
- **Supabase/PostgreSQL** for persistent data; see `.env` and `database/` for schema and connection
- **JWT authentication** (see `src/middleware/auth.ts` and `.env`)
- **Swagger/OpenAPI** docs auto-generated (`src/config/swagger.ts`, `/api-docs` endpoint)
- **Socket.IO** for real-time features (`src/services/socketService.ts`)
- **Email via SMTP** (`src/services/emailService.ts`)

## 🗂️ Key Directories & Files
- `src/controllers/` — Business logic per domain (User, Auth, Request, Offer, etc.)
- `src/routes/` — Route definitions, grouped by resource
- `src/services/` — External integrations (email, sockets, pricing, etc.)
- `src/config/` — App, DB, Swagger config
- `database/` — SQL schema and migration scripts
- `.env` — All secrets, connection strings, and config
- `test-*.js` — API and integration tests

## 🛠️ Developer Workflows
- **Install dependencies:** `npm install`
- **Configure environment:** Use `.env` (see `env.example` for template)
- **Setup Supabase credentials:** `npm run configure-credentials` (interactive)
- **Setup DB schema:** `npm run setup-db` (prints SQL for Supabase)
- **Verify config:** `npm run verify-supabase`
- **Run dev server:** `npm run dev`
- **Build:** `npm run build`
- **Test basic API:** `npm run test:basic`
- **Test full API:** `npm run test:api`
- **Swagger docs:** `npm run test:swagger` or visit `/api-docs`

## 🧩 Patterns & Conventions
- **Controllers**: Thin, delegate to services; avoid business logic in routes
- **Services**: Encapsulate external calls (Supabase, email, sockets)
- **Validation**: Use Joi schemas (`src/middleware/schemas.ts`)
- **Error handling**: Consistent error responses via middleware
- **Rate limiting**: Configurable via `.env`, enforced in middleware
- **Security**: JWT, CORS, Helmet, Row Level Security in Supabase
- **Testing**: Use provided scripts; tests log summary and URLs

## 🔗 Integration Points
- **Supabase**: All DB access via Supabase REST/SQL
- **Email**: SMTP config in `.env`, logic in `emailService.ts`
- **Socket.IO**: Real-time events, see `socketService.ts`
- **Swagger**: API docs auto-generated from JSDoc comments

## 📝 Examples
- **Create Request**: See Swagger docs and `RequestController.ts`
- **Register User**: See `AuthController.ts` and Swagger usage examples
- **Offer Flow**: See `OfferController.ts`, `Offer` schema in Swagger

## ⚠️ Project-Specific Notes
- **Do not hardcode secrets**; always use `.env`
- **Scripts** automate setup and verification; prefer them over manual steps
- **All endpoints and schemas are documented in Swagger**
- **Logs**: See `logs/` for server and error logs

---
_If any section is unclear or missing, please provide feedback to improve these instructions._
