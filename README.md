# Order Management System

A full-stack Order Management Web Application built with Node.js, Express, MongoDB, React, and Tailwind CSS.

## Features

- JWT-based authentication with refresh tokens
- Role-based access control (Admin / User)
- Complete CRUD for Items and Orders
- Dashboard with analytics and charts
- Search, filter, and pagination
- Responsive design (mobile, tablet, desktop)
- Toast notifications and loading states

## Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs  
**Frontend:** React 18, React Router v6, Axios, Tailwind CSS

## Project Structure

```
newOne/
├── server/          # Express + MongoDB backend
├── client/          # React + Tailwind CSS frontend
├── README.md
├── SETUP.md
└── API_DOCUMENTATION.md
```

## Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Backend
```bash
cd server
npm install
cp .env.example .env  # edit with your MongoDB URI + secrets
npm run dev           # starts on http://localhost:5000
```

### Frontend
```bash
cd client
npm install
cp .env.example .env
npm start             # starts on http://localhost:3000
```

## Documentation

- [Setup Guide](./SETUP.md)
- [API Documentation](./API_DOCUMENTATION.md)
