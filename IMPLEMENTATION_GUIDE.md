# LECO License Management

## Architecture

```
Next.js 16 UI (frontend :3000)
  └─ Axios bearer-token client
       └─ Express REST API (backend :8080)
            ├─ JWT middleware
            ├─ controllers / routes
            └─ MySQL (leco_license_db)
```

The frontend keeps the authenticated user and JWT in browser storage. Every API request receives the `Authorization: Bearer <token>` header. Express validates it before allowing license, request, assignment, or administration actions. Administration routes also require the `ADMIN` role.

## Important folders

```
frontend/app/                 Screens and routes
frontend/components/          App shell, navigation, route protection
frontend/context/             Authentication provider
frontend/lib/axios.ts         Authenticated API client
backend/src/controllers/      Business rules and database queries
backend/src/routes/           REST endpoints
backend/src/middleware/       JWT and role middleware
backend/database.sql          MySQL schema
backend/seed.js               Sample users, licenses and requests
```

## First-time setup

1. Create the database:

   ```bash
   mysql -u root -p < database.sql
   ```

2. Create `backend/.env`:

   ```env
   PORT=8080
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=leco_license_db
   JWT_SECRET=replace_with_a_long_random_secret
   JWT_EXPIRES_IN=8h
   ```

3. Install and seed the backend:

   ```bash
   cd backend
   npm install
   node seed.js
   npm run dev
   ```

4. In another terminal, start the UI:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. Open `http://localhost:3000` and sign in with `admin / admin123`.

## Main API surface

| Area | Endpoint |
| --- | --- |
| Sign in | `POST /api/auth/login` |
| Requests | `GET, POST /api/requests` |
| Licenses | `GET /api/licenses`, `GET /api/licenses/available` |
| Assignments | `GET, POST /api/assignments`, `PATCH /api/assignments/:id` |
| Administration | `GET, POST /api/admin/users`, `GET /api/admin/audit` |

When an assignment is created, the selected license becomes `ASSIGNED`, the selected open request becomes `APPROVED`, and an audit event is recorded. Releasing or expiring an assignment returns the license to `AVAILABLE`.
