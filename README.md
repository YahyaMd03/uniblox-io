# Uniblox E-commerce Store

A production-quality full-stack e-commerce application with an in-memory store, shopping cart, checkout system, and a global nth-order coupon engine.

## Architecture

This is a monorepo containing:

- **Backend**: Node.js + Express + TypeScript with in-memory data store
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS

### Backend Structure

```
backend/
  src/
    app.ts              # Express application entry point
    routes/             # API route handlers
      cart-routes.ts
      checkout-routes.ts
      admin-routes.ts
      coupon-routes.ts
    services/           # Business logic layer
      cart-service.ts
      checkout-service.ts
      coupon-service.ts
      product-service.ts
      admin-service.ts
    store/              # Data persistence layer
      memory-store.ts
    models/             # Type definitions
      types.ts
  tests/                # Jest unit tests
    coupon-service.test.ts
    checkout-service.test.ts
```

### Frontend Structure

```
frontend/
  app/
    page.tsx           # Product list page
    cart/
      page.tsx         # Shopping cart page
    admin/
      page.tsx         # Admin dashboard
    components/
      Nav.tsx          # Navigation component
    layout.tsx         # Root layout
    providers.tsx      # Context providers
  lib/
    api.ts             # API client
    context.tsx        # User context (userId management)
```

## Coupon Logic

The system implements a **rolling counter coupon engine** with the following rules:

1. **Generation**: Every 4th order (n=4) automatically generates a new coupon code
2. **Uniqueness**: Only one active coupon exists at a time
3. **Discount**: Coupons provide a 10% discount on the entire order
4. **Single Use**: Each coupon can only be used once
5. **Invalidation**: Coupons become invalid immediately after use
6. **Sliding Window**: When a coupon is used, the counter resets and the next coupon becomes available on the 4th order from that point
7. **Deterministic**: Coupon codes are generated deterministically (same order count = same code)

### Coupon Code Format

Coupons follow the format: `SAVE10-XXXX` where `XXXX` is a 4-character alphanumeric code generated deterministically based on the order count.

### Example Flow

1. User places orders 1-3: No coupon generated
2. User places order 4: New coupon `SAVE10-AB12` is generated and becomes active
3. User places order 5 with coupon `SAVE10-AB12`: 
   - Coupon is validated and applied (10% discount)
   - Coupon is marked as used/invalid
   - Counter resets to 0
   - Order is created
4. User places orders 6-8: No coupon available (counter: 1, 2, 3)
5. User places order 9: New coupon `SAVE10-CD34` is generated (counter reaches 4)
6. If coupon from order 4 is not used, it remains available for subsequent orders until used

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

4. Run tests:
```bash
npm test
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

4. Open your browser and navigate to `http://localhost:3000`

## API Documentation

### Base URL

```
http://localhost:3001
```

### Cart Endpoints

#### POST /cart/add

Add an item to the user's cart.

**Request Body:**
```json
{
  "userId": "user-123",
  "productId": "1",
  "quantity": 2
}
```

**Response:**
```json
{
  "cart": {
    "userId": "user-123",
    "items": [
      {
        "productId": "1",
        "quantity": 2,
        "product": {
          "id": "1",
          "name": "Laptop",
          "price": 999.99,
          "description": "High-performance laptop"
        }
      }
    ],
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

#### POST /cart/view

View the user's cart with product details.

**Request Body:**
```json
{
  "userId": "user-123"
}
```

**Response:**
```json
{
  "cart": {
    "userId": "user-123",
    "items": [...],
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "total": 1999.98
  }
}
```

### Checkout Endpoint

#### POST /checkout

Process checkout and create an order.

**Request Body:**
```json
{
  "userId": "user-123",
  "couponCode": "SAVE10-AB12"  // Optional
}
```

**Response:**
```json
{
  "order": {
    "id": "order-1234567890-abc123",
    "userId": "user-123",
    "items": [...],
    "subtotal": 999.99,
    "discount": 99.99,
    "total": 899.99,
    "couponCode": "SAVE10-AB12",
    "createdAt": "2024-01-01T12:00:00.000Z"
  },
  "message": "Order placed successfully"
}
```

### Coupon Endpoints

#### GET /coupon/active

Get the currently active coupon code (if any).

**Response:**
```json
{
  "coupon": {
    "code": "SAVE10-AB12",
    "discountPercent": 10,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "isValid": true
  }
}
```

Or if no active coupon exists:
```json
{
  "coupon": null
}
```

### Admin Endpoints

#### GET /admin/stats

Get comprehensive admin statistics.

**Response:**
```json
{
  "activeCoupon": {
    "code": "SAVE10-AB12",
    "discountPercent": 10,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "isValid": true
  },
  "totalItemsSold": 25,
  "totalRevenue": 12499.75,
  "totalDiscountGiven": 1249.98,
  "allCoupons": [...],
  "totalOrders": 10
}
```

#### POST /admin/generate-coupon

Manually generate a new coupon (admin override).

**Response:**
```json
{
  "coupon": {
    "code": "SAVE10-AB12",
    "discountPercent": 10,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "isValid": true
  }
}
```

### Health Check

#### GET /health

Check server health.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Features

### User Features

- ✅ Browse products
- ✅ Add items to cart
- ✅ View cart with product details
- ✅ Request active coupon code
- ✅ Apply coupon codes at checkout
- ✅ Complete checkout process
- ✅ User ID simulation (change userId in navigation)

### Admin Features

- ✅ View active coupon
- ✅ View total items sold
- ✅ View total revenue
- ✅ View total discount given
- ✅ View all generated coupon codes
- ✅ Manually generate coupons

### Business Logic

- ✅ Automatic coupon generation every 4th order
- ✅ Single active coupon at a time
- ✅ Coupon validation and application
- ✅ Automatic coupon invalidation after use
- ✅ Sliding window: Counter resets when coupon is used
- ✅ Deterministic coupon code generation

## Testing

The backend includes comprehensive Jest unit tests for:

- Coupon service (nth-order logic, validation, application)
- Checkout service (order processing, coupon application)

Run tests with:
```bash
cd backend
npm test
```

## CI

This project includes a GitHub Actions workflow that:

- Runs backend unit tests on every PR and push to `main`
- Ensures the discount engine and checkout logic remain correct

This mirrors how production teams enforce quality gates.

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Testing**: Jest
- **Architecture**: Clean architecture with separation of concerns

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API

## Development Notes

- The backend uses an in-memory store (data resets on server restart)
- User IDs are managed via localStorage in the frontend
- The coupon engine is deterministic for testing purposes
- All business logic is well-commented and follows clean architecture principles

## License

ISC
