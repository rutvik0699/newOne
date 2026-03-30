# Order Management System

A full-stack, production-ready Order Management Web Application built with **Node.js + Express + MongoDB** (backend) and **React + Tailwind CSS** (frontend).

## Features

- **Authentication**: JWT-based login/register/logout with refresh tokens
- **Items Management**: Full CRUD with search, category filter, and pagination
- **Orders Management**: Create, update, delete orders with status tracking
- **Dashboard Analytics**: Revenue stats, charts, recent orders (admin only)
- **Role-Based Access**: Admin and User roles
- **Responsive Design**: Mobile, tablet, and desktop friendly
- **Export**: Download orders as CSV
- **Security**: Helmet, CORS, rate limiting, password hashing

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose ODM
- JWT (jsonwebtoken) for authentication
- bcryptjs for password hashing
- Helmet, CORS, Morgan, express-rate-limit

### Frontend
- React 18 with React Router v6
- Tailwind CSS for styling
- Axios with interceptors for API calls
- Recharts for data visualization
- Context API for state management

## Quick Start

See [SETUP.md](./SETUP.md) for detailed instructions.

```bash
# Backend
cd server && npm install && cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets
npm run dev

# Frontend (new terminal)
cd client && npm install && cp .env.example .env
npm start
```

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for all endpoints.

## License

ISC
