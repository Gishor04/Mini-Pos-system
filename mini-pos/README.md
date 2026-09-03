# Mini POS System

A practical, clean, full-stack Point of Sale (POS) system built with **Next.js**, **NestJS**, and **PostgreSQL**.

---

## 1. Technology Stack

- **Frontend**: Next.js (App Router), TypeScript, React, Tailwind CSS
- **Backend**: NestJS, TypeScript, REST API
- **Database**: PostgreSQL, Prisma ORM
- **Authentication**: JWT, bcrypt

---

## 2. Project Architecture

The repository enforces strict separation between Frontend and Backend:

```text
mini-pos/
├── frontend/          # Next.js Application
└── backend/           # NestJS Application
```

---

## 3. Environment Setup

### Backend Environment Variables (`backend/.env`)

```env
DATABASE_URL="postgresql://<YOUR_DB_USER>:<YOUR_DB_PASSWORD>@localhost:5432/minipos?schema=public"
JWT_SECRET="super-secret-pos-key-change-in-prod"
PORT=3001
```

### Frontend Environment Variables (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

---

## 4. Getting Started

### Step 1: Install Dependencies

#### Terminal 1 (Backend):
```bash
cd backend
npm install
```

#### Terminal 2 (Frontend):
```bash
cd frontend
npm install
```

### Step 2: Database Migration & Seed

Make sure your PostgreSQL server is running and accessible via `DATABASE_URL`.

```bash
cd backend
npx prisma migrate dev --name init
npm run seed
```



### Step 3: Run Applications

#### Start Backend API (Port 3001):
```bash
cd backend
npm run start:dev
```

#### Start Frontend Web App (Port 3000):
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. API Endpoints

```text
POST   /auth/login     # Log in and receive JWT token

GET    /products       # List products (supports ?search= query)
GET    /products/:id   # Get single product details
POST   /products       # Create product (SKU must be unique)
PATCH  /products/:id   # Update product
DELETE /products/:id   # Delete product

POST   /sales          # Create sale (calculates total & updates stock in DB transaction)
GET    /sales          # List all past sales
GET    /sales/:id      # Get sale invoice details
```
