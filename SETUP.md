# Setup Guide

## Prerequisites

- Node.js v16+
- MongoDB (local or Atlas)
- npm or yarn

## Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/order-management
   JWT_SECRET=your_strong_secret_here
   JWT_REFRESH_SECRET=your_refresh_secret_here
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:3000
   ```

4. Start the server:
   ```bash
   npm run dev    # development with nodemon
   npm start      # production
   ```

## Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the React app:
   ```bash
   npm start
   ```

## Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## First Admin User

Register a user via `POST /api/auth/register` with `"role": "admin"` in the body, then use the login endpoint to get your JWT token.
