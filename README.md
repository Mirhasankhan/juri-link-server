## Juri Link Server

Backend API for the Juri Link platform. This service provides authentication, user onboarding, legal service listings, booking flow, subscriptions, payments, messaging, and admin management.

## Tech Stack

- Node.js + TypeScript
- Express.js
- MongoDB + Mongoose
- Redis
- Stripe
- WebSocket (`ws`)
- Cloudinary + DigitalOcean Spaces (file/media)

## Core Features

- Role-aware authentication and authorization
- User onboarding with OTP flow
- Lawyer/legal service management
- Booking lifecycle (create, cancel, complete, refund request)
- Earnings and withdrawal requests
- Stripe subscription checkout + webhook handling
- Real-time chat via WebSocket with Redis-backed message buffering
- Admin dashboard/reporting endpoints

## Project Structure

```txt
src/
	app.ts                      # Express app setup
	server.ts                   # DB, Redis, HTTP server bootstrapping
	app/
		config/                   # Env + app config and error formatters
		middleware/               # Auth, validation, rate limiting, parser
		modules/                  # Domain modules (auth, user, booking, etc.)
		routes/                   # API route aggregation
		utils/                    # Shared helpers (jwt, email, pagination, etc.)
```

## Prerequisites

- Node.js 18+
- MongoDB instance
- Redis server (default expected at `127.0.0.1:6379`)
- Stripe account and webhook secret

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root.

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb://127.0.0.1:27017/juri-link

BCRYPT_SALT_ROUND=10
JWT_SECRET=your_jwt_secret
JWT_FORGET_KEY=your_forget_password_secret
GEN_SALT=your_otp_salt
EXPIRES_IN=7d

CLIENT_URL=http://localhost:3000
API_LINK=http://localhost:5000

EMAIL=example@gmail.com
APP_PASS=your_gmail_app_password
SMTP_USER_NAME=optional
SMTP_PASSWORD=optional

ENCRYPTION_KEY=optional
ENCRYPTION_IV=optional

DO_SPACES_ENDPOINT=optional
DO_BUCKET_NAME=optional
DO_ACCESS_KEY=optional
DO_SECRET_KEY=optional
DO_CDN_ENDPOINT=optional

CLOUD_NAME=optional
API_KEY=optional
API_SECRET=optional

STRIPE_SK=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Available Scripts

- `npm run dev` - run server in development with auto-reload
- `npm run build` - compile TypeScript to `dist/`
- `npm run start` - run compiled production server (`dist/server.js`)
- `npm run prod` - alias for production server (`dist/server.js`)
- `npm run lint` - run ESLint
- `npm run lint-fix` - auto-fix lint issues
- `npm run docker:build` - build Docker image
- `npm run docker:run` - run Docker container with local port 5000
- `npm run docker:up` - start all services (API, MongoDB, Redis) via Docker Compose
- `npm run docker:down` - stop all Docker Compose services

## Running with Docker

### 1. Using Docker Compose (Recommended)
This starts the backend API together with MongoDB and Redis containers:

```bash
# Copy and configure environment variables
cp .env.example .env

# Start all containers in the background
docker compose up -d --build

# View container logs
docker compose logs -f

# Stop all containers
docker compose down
```

### 2. Standalone Docker Container

```bash
# Build the Docker image
docker build -t juri-link-backend .

# Run container (loads your .env file)
docker run -d -p 5000:5000 --name juri-link-backend --env-file .env juri-link-backend
```

## Running Locally

```bash
npm run dev
```

Health check endpoint:

- `GET /` -> returns `Server is running now`

Base API prefix:

- `/api/v1`

## API Modules (Route Prefixes)

- `/api/v1/auth`
- `/api/v1/user`
- `/api/v1/legal-service`
- `/api/v1/post`
- `/api/v1/booking`
- `/api/v1/message`
- `/api/v1/subscription-plan`
- `/api/v1/availability`
- `/api/v1/earning`
- `/api/v1/review`
- `/api/v1/admin`
- `/api/v1/term-privacy`

## Endpoint Overview

### Auth

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/send-otp`
- `POST /api/v1/auth/verify-otp`
- `PATCH /api/v1/auth/reset-password` (auth)
- `PUT /api/v1/auth/update` (auth)
- `PUT /api/v1/auth/upload/intro-video` (auth + multipart)
- `PUT /api/v1/auth/upload/profileImage` (auth + multipart)

### User

- `POST /api/v1/user/request` (multipart)
- `POST /api/v1/user/resend-otp`
- `POST /api/v1/user/verify`
- `GET /api/v1/user/profile` (auth)
- `GET /api/v1/user/details/:id`
- `GET /api/v1/user/all`

### Booking

- `POST /api/v1/booking/create` (role: User)
- `POST /api/v1/booking/mark-completed/:id` (auth)
- `PUT /api/v1/booking/cancel` (auth)
- `PUT /api/v1/booking/refund-request` (auth)
- `GET /api/v1/booking/user-wise` (role: User)
- `GET /api/v1/booking/lawyer-wise` (role: Lawyer)

### Subscription

- `POST /api/v1/subscription-plan/create`
- `GET /api/v1/subscription-plan/` (auth)
- `POST /api/v1/subscription-plan/checkout-session` (role: Lawyer)
- `DELETE /api/v1/subscription-plan/cancel` (role: Lawyer)

### Message

- `GET /api/v1/message/` (auth)

### Admin

- `POST /api/v1/admin/login`
- `POST /api/v1/admin/create` (role: SuperAdmin)
- `GET /api/v1/admin/all` (role: SuperAdmin)
- `GET /api/v1/admin/all-users` (role: SuperAdmin, UserAdmin)
- `GET /api/v1/admin/all-lawyers` (role: SuperAdmin, UserAdmin)
- `GET /api/v1/admin/withdraw-requests` (role: SuperAdmin, UserAdmin)
- `DELETE /api/v1/admin/delete/:id` (role: SuperAdmin)
- `POST /api/v1/admin/withdraw-request/accept/:id` (role: SuperAdmin, FinanceAdmin)
- `GET /api/v1/admin/reports` (role: SuperAdmin, UserAdmin)
- `GET /api/v1/admin/overview` (role: SuperAdmin, UserAdmin)
- `PUT /api/v1/admin/response-report` (role: SuperAdmin, UserAdmin)

### Other Modules

- Post: create/list/detail/like/comment/reply
- Review: create review + create report (multipart)
- Availability: create/manage lawyer slots
- Earning: summary + withdrawal flow
- Legal Service: create/list/detail
- Terms & Privacy: create/get

## WebSocket (Real-Time Chat)

The WebSocket server is attached to the same HTTP server. Authentication requires `x-token` (JWT) via header or query.

Implemented event types:

- `member-conversation`
- `member-subscribe`
- `past-messages`
- `member-send-message`
- `member-new-message`
- `increment_unread`

Redis is used for room message buffering and unread counters. Older buffered messages are persisted into MongoDB in batches.

## Stripe Webhook

Endpoint:

- `POST /webhook/stripe`

This route uses raw body parsing and verifies signatures with `STRIPE_WEBHOOK_SECRET`.

## Deployment Notes

- Vercel config currently points to `dist/server.js` while TypeScript build outputs runtime entry at `dist/src/server.js`.
- Update deployment entry path accordingly before production deployment.

## Seed Behavior

On server start, a super admin is auto-seeded if none exists.

Default seeded credentials in current code:

- Email: `admin@gmail.com`
- Password: `123456`

Change this behavior/credentials before production usage.

## License

ISC

