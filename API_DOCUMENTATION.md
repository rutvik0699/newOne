# API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <accessToken>`

---

## Authentication

### POST /auth/register
Register a new user.

**Body:**
```json
{ "name": "John Doe", "email": "john@example.com", "password": "secret123", "role": "user" }
```

### POST /auth/login
Login and receive tokens.

**Body:** `{ "email": "john@example.com", "password": "secret123" }`

**Response:** `{ accessToken, refreshToken, user: { id, name, email, role } }`

### POST /auth/logout
Logout (requires auth).

### POST /auth/refresh
Refresh access token.

**Body:** `{ "refreshToken": "..." }`

### GET /auth/profile
Get current user profile (requires auth).

### PUT /auth/profile
Update profile (requires auth).

**Body:** `{ "name", "phone", "address" }`

---

## Items

### POST /items (Admin)
Create a new item.

**Body:** `{ "name", "description", "price", "quantity", "category", "sku" }`

### GET /items
List items with pagination.

**Query:** `?page=1&limit=10&search=keyword&category=Electronics`

### GET /items/:id
Get a single item by ID.

### PUT /items/:id (Admin)
Update an item.

### DELETE /items/:id (Admin)
Delete an item.

---

## Orders

### POST /orders
Create a new order.

**Body:**
```json
{
  "items": [{ "itemId": "...", "quantity": 2 }],
  "notes": "Optional notes",
  "deliveryDate": "2024-01-15"
}
```

### GET /orders
List orders.

**Query:** `?page=1&limit=10&status=Pending&startDate=2024-01-01&endDate=2024-12-31&search=ORD`

### GET /orders/:id
Get a single order with populated items and user.

### PUT /orders/:id
Update an order (status, notes, deliveryDate, items).

### DELETE /orders/:id
Delete an order.

### GET /orders/filter/by-date
Filter orders by date range.

**Query:** `?startDate=2024-01-01&endDate=2024-12-31`

---

## Dashboard (Admin only)

### GET /dashboard/stats
Get overview stats: totalOrders, totalRevenue, totalItems, totalUsers.

### GET /dashboard/recent-orders
Get last 10 orders.

### GET /dashboard/monthly-revenue
Get monthly revenue for a year.

**Query:** `?year=2024`

### GET /dashboard/order-status
Get order count by status.

---

## Response Format

```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

Paginated:
```json
{
  "success": true,
  "data": [...],
  "pagination": { "total", "page", "limit", "totalPages", "hasNextPage", "hasPrevPage" }
}
```

Error:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [{ "field": "email", "message": "Valid email required" }]
}
```
