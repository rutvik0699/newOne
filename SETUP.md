# Setup Guide

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

## Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/order_management
JWT_SECRET=your_super_secret_jwt_key_change_me
JWT_REFRESH_SECRET=your_refresh_secret_key_change_me
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
NODE_ENV=development
```

Start the server:

```bash
npm run dev   # development (nodemon)
npm start     # production
```

The API will be available at `http://localhost:5000`.

## Frontend Setup

```bash
cd client
npm install
cp .env.example .env
```

Edit `.env`:

```
REACT_APP_API_URL=http://localhost:5000/api
```

Start the app:

```bash
npm start     # development server on http://localhost:3000
npm run build # production build
```

## First Run

1. Register an admin account via `POST /api/auth/register` with role `Admin`
2. Or seed the database manually via MongoDB shell / Compass

## Environment Variables

### Server

| Variable            | Description                    | Default           |
|---------------------|--------------------------------|-------------------|
| PORT                | Server port                    | 5000              |
| MONGO_URI           | MongoDB connection string      | (required)        |
| JWT_SECRET          | JWT signing secret             | (required)        |
| JWT_REFRESH_SECRET  | Refresh token secret           | (required)        |
| JWT_EXPIRE          | Access token expiry            | 7d                |
| JWT_REFRESH_EXPIRE  | Refresh token expiry           | 30d               |
| NODE_ENV            | Environment                    | development       |

### Client

| Variable             | Description       | Default                    |
|----------------------|-------------------|----------------------------|
| REACT_APP_API_URL    | Backend API URL   | http://localhost:5000/api  |
