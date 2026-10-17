# CareerBridge Backend

A production-grade, modular Node.js & Express REST API with real-time Socket.IO capabilities, MongoDB Mongoose ODM, JWT authentication, and structured logging.

---

## 📁 Project Structure

```text
backend/
├── src/
│   ├── app.js                  # Express app setup, middlewares, and route mounting
│   ├── server.js               # Server entry point, database connection & Socket.io
│   ├── config/
│   │   ├── database.js         # Mongoose connection logic
│   │   ├── env.js              # Environment variable loader & defaults
│   │   └── cors.js             # CORS configuration & origins whitelist
│   ├── modules/
│   │   ├── auth/               # Authentication module
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.validation.js
│   │   │   └── auth.test.js
│   │   ├── users/              # User management & profile module
│   │   │   ├── user.model.js
│   │   │   ├── user.controller.js
│   │   │   ├── user.routes.js
│   │   │   ├── user.service.js
│   │   │   └── user.validation.js
│   │   ├── jobs/               # Job postings & referral applications
│   │   │   ├── job.model.js
│   │   │   ├── job.controller.js
│   │   │   ├── job.routes.js
│   │   │   ├── job.service.js
│   │   │   └── job.validation.js
│   │   ├── directory/          # Alumni & Student directory & networking
│   │   │   ├── directory.controller.js
│   │   │   ├── directory.routes.js
│   │   │   └── directory.service.js
│   │   ├── ai/                 # AI Resume & Portfolio generation
│   │   │   ├── ai.controller.js
│   │   │   ├── ai.routes.js
│   │   │   └── ai.service.js
│   │   └── notifications/      # Real-time notifications and message models
│   │       └── notification.model.js
│   ├── middleware/
│   │   ├── authenticate.js     # JWT verification middleware
│   │   ├── authorize.js        # Role-based access control (RBAC)
│   │   ├── validateRequest.js  # Schema & input validation middleware
│   │   ├── errorHandler.js     # Centralized error handling
│   │   ├── notFound.js         # 404 handler for missing routes
│   │   └── rateLimiter.js      # In-memory IP rate limiting
│   ├── utils/
│   │   ├── ApiError.js         # Custom operational error class
│   │   ├── asyncHandler.js     # Async controller wrapper
│   │   └── logger.js           # Formatted console & file logger
│   ├── services/
│   │   └── socket.service.js   # Socket.IO chat and real-time events
│   ├── jobs/
│   │   └── cleanup.job.js      # Background / scheduled tasks
│   └── tests/
│       └── app.test.js         # Integration and route test suite
├── logs/                       # Application runtime logs
├── .env.example                # Example environment variables
├── .gitignore                  # Git ignore rules
├── package.json                # Project dependencies and npm scripts
└── README.md                   # Documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18.0.0 or higher recommended)
- MongoDB Atlas or local MongoDB instance

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in your variables:

```bash
cp .env.example .env
```

Example `.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/careerbridge?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,https://careerbridge-red.vercel.app
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Running the Server

#### Development (Hot Reload):
```bash
npm run dev
```

#### Production:
```bash
npm start
```

### 5. Running Tests
```bash
npm test
```

---

## 📡 Key API Endpoints

### Health Check
- `GET /` — Server check (`{ success: true, message: "backend is working" }`)
- `GET /health` — Health status, uptime, timestamp

### Authentication (`/api/auth`)
- `POST /api/auth/signup` — Register a new student/alumni account
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/me` — Get authenticated user details (Bearer token required)
- `GET /api/auth/users` — Fetch all users (compatible with frontend directory)

### Users (`/api/users`)
- `GET /api/users` — List users with query filters
- `GET /api/users/:id` — Retrieve user profile by ID
- `PUT /api/users/:id` — Update profile details
- `GET /api/users/stats/admin` — Admin analytics counts (students, alumni, jobs)

### Jobs & Referrals (`/api/jobs`)
- `GET /api/jobs` — Retrieve active jobs and referrals
- `POST /api/jobs` — Create a job posting
- `GET /api/jobs/:id` — Get single job details
- `POST /api/jobs/:id/apply` — Apply or request referral for a job

### Directory & Networking (`/api/directory`)
- `GET /api/directory/alumni` — Filterable alumni network
- `GET /api/directory/students` — Filterable student directory
- `POST /api/connect/request` — Send networking connection request
- `POST /api/directory/connect/accept` — Accept networking connection request

### AI Studio (`/api/ai`)
- `POST /api/ai/build-resume` — Generate structured markdown resume
- `POST /api/ai/build-portfolio` — Generate customized portfolio HTML template

### Real-time Chat & Notifications (Socket.IO)
- `join_chat` (`userId`) — Join personal notification room
- `send_message` (`{ receiverId, senderName, text }`) — Emit direct message and alert
