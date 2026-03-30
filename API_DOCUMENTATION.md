# API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require the header:
```
Authorization: Bearer <access_token>
```

---

## Authentication

### POST /auth/register
Register a new user.

**Body:**
```json
{ "name": "John Doe", "email": "john@example.com", "password": "secret123", "role": "User" }
```

**Response:** `201`
```json
{ "success": true, "token": "...", "refreshToken": "...", "user": { "id": "...", "name": "John Doe", "email": "john@example.com", "role": "User" } }
```

---

### POST /auth/login
Login with credentials.

**Body:**
```json
{ "email": "john@example.com", "password": "secret123" }
```

**Response:** `200`
```json
{ "success": true, "token": "...", "refreshToken": "...", "user": { ... } }
```

---

### POST /auth/logout
Invalidate the current refresh token. **Protected.**

**Response:** `200`
```json
{ "success": true, "message": "Logged out successfully" }
```

---

### POST /auth/refresh
Get a new access token using a refresh token.

**Body:**
```json
{ "refreshToken": "..." }
```

**Response:** `200`
```json
{ "success": true, "token": "..." }
```

---

### GET /auth/profile
Get the authenticated user's profile. **Protected.**

**Response:** `200`
```json
{ "success": true, "user": { "id": "...", "name": "...", "email": "...", "role": "..." } }
```

---

## Items

### GET /items
Get all items with pagination and search.

**Query params:** `page`, `limit`, `search`, `category`, `isActive`

**Response:** `200`
```json
{ "success": true, "data": [...], "pagination": { "page": 1, "limit": 10, "total": 50, "totalPages": 5 } }
```

---

### GET /items/:id
Get a single item by ID.

---

### POST /items
Create a new item. **Protected (Admin).**

**Body:**
```json
{ "name": "Widget", "description": "A widget", "price": 9.99, "quantity": 100, "category": "Electronics", "sku": "WGT-001" }
```

---

### PUT /items/:id
Update an item. **Protected (Admin).**

---

### DELETE /items/:id
Delete an item. **Protected (Admin).**

---

## Orders

### GET /orders
Get all orders with filtering. **Protected.**

**Query params:** `page`, `limit`, `status`, `startDate`, `endDate`, `search`

---

### GET /orders/analytics/summary
Get order analytics grouped by status. **Protected.**

---

### GET /orders/:id
Get a single order by ID. **Protected.**

---

### POST /orders
Create a new order. **Protected.**

**Body:**
```json
{
  "userId": "...",
  "items": [{ "itemId": "...", "name": "Widget", "quantity": 2, "price": 9.99 }],
  "notes": "Rush delivery",
  "deliveryDate": "2024-12-31"
}
```

---

### PUT /orders/:id
Update an order's status, notes, or delivery date. **Protected.**

**Body:**
```json
{ "status": "Completed", "notes": "Delivered", "deliveryDate": "2024-12-25" }
```

---

### DELETE /orders/:id
Delete an order. **Protected.**

---

## Dashboard

All dashboard endpoints are **Protected**.

### GET /dashboard/stats
Returns total orders, total revenue, total items, total users, and current month stats.

### GET /dashboard/recent-orders
Returns the 10 most recent orders with user info.

### GET /dashboard/monthly-sales
Returns aggregated monthly sales data for the last 12 months.

---

## Error Responses

All errors follow the format:
```json
{ "success": false, "message": "Error description" }
```

| Status | Meaning               |
|--------|-----------------------|
| 400    | Bad Request           |
| 401    | Unauthorized          |
| 403    | Forbidden             |
| 404    | Not Found             |
| 500    | Internal Server Error |
