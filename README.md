# CRM Backend Application 2.0

A Node.js, Express.js, and MongoDB backend application designed for managing Customer Relationship Management (CRM) workflows. It supports role-based access control for **CUSTOMER**, **ENGINEER**, and **ADMIN** users, automated ticket assignment, user registration approvals, and token-based authentication.

---

## Table of Contents
- [Features](#features)
- [Project Architecture & Structure](#project-architecture--structure)
- [Why the Project Was Not Running & Fixes Applied](#why-the-project-was-not-running--fixes-applied)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Installation & Execution](#installation--execution)
- [API Endpoints Reference](#api-endpoints-reference)
  - [Health Check](#health-check)
  - [Authentication Routes](#authentication-routes)
  - [User Management Routes](#user-management-routes)
  - [Ticket Management Routes](#ticket-management-routes)
- [Data Models & Constants](#data-models--constants)

---

## Features
- **User Authentication**: Secure sign-up and sign-in using bcrypt password hashing and JSON Web Tokens (JWT).
- **Role-Based Authorization**:
  - `CUSTOMER`: Auto-approved on sign-up, can create and view their own tickets.
  - `ENGINEER`: Requires `ADMIN` approval, can view and update tickets assigned to them.
  - `ADMIN`: Requires `ADMIN` approval, full access to view/update all users and tickets.
- **Smart Ticket Assignment**: Automatically assigns new customer tickets to a randomly selected approved Engineer.
- **Clean Architecture**: Modular structure dividing code into `configs`, `constants`, `controllers`, `middlewares`, `models`, and `routes` inside a standard `src/` folder.

---

## Project Architecture & Structure

```
backend_crm_pplication/
├── .env                   # Environment configuration variables
├── package.json           # Dependencies and startup scripts
├── README.md              # Project documentation
└── src/
    ├── configs/           # Application & DB configurations
    │   ├── auth.config.js
    │   ├── db.config.js
    │   └── server.config.js
    ├── constants/         # Enums & Status constants
    │   └── index.js
    ├── controllers/       # Request handlers & business logic
    │   ├── auth.controller.js
    │   ├── user.controller.js
    │   └── ticket.controller.js
    ├── middlewares/       # JWT Verification & Authorization guards
    │   └── verifyJwt.js
    ├── models/            # Mongoose Schemas
    │   ├── user.model.js
    │   └── ticket.model.js
    ├── routes/            # Express API endpoint definitions
    │   ├── auth.routes.js
    │   ├── user.routes.js
    │   └── ticket.routes.js
    └── index.js           # Main application entry point
```

---

## Why the Project Was Not Running & Fixes Applied

1. **Environment Variable Collision**: Windows defines `USERNAME` as the OS user. Previously, `db.config.js` read `process.env.USERNAME`, causing Mongo connection strings to fail. Added `dotenv` and explicit `DB_USERNAME` handling.
2. **Missing `src/` Directory**: Code was scattered across the root directory with inconsistent naming (e.g. `routs/`). Restructured everything cleanly into `src/`.
3. **Broken User Routes**: `user.routs.js` previously contained duplicated code from `ticket.routs.js`. Fixed `user.routes.js` to correctly route User Controller actions.
4. **Runtime Typos**: `user.controller.js` and `ticket.controller.js` contained `req.status(...)` calls instead of `res.status(...)`. Fixed all occurrences.
5. **Deprecated Mongoose Method**: Replaced `User.count()` with `User.countDocuments()`.
6. **Unhandled String User IDs**: Replaced `User.findById(userId)` with `User.findOne({ userId })` and `User.findOneAndUpdate({ userId }, ...)` to correctly query custom string `userId` fields.
7. **Middleware Flow Control**: Added explicit `return` statements in `verifyJwt.js` to prevent double response headers on error.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or a local MongoDB database instance

### Environment Configuration
Create or update the `.env` file in the root directory:

```env
PORT=3000
DB_USERNAME=your_mongodb_username
PASSWORD=your_mongodb_password
DB_NAME=crm_db
SECRET_KEY=your_jwt_secret_key
# Optional: Set full connection string directly
# MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/crm_db
```

### Installation & Execution

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```
   Or:
   ```bash
   npm run dev
   ```

---

## API Endpoints Reference

### Health Check
- **GET** `/crm/api/v1/health`
  - Returns `200 OK` if the backend is running.

---

### Authentication Routes

#### 1. Sign Up
- **POST** `/crm/api/v1/auth/signup`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "userId": "JOHND123",
    "password": "Password123!",
    "userType": "CUSTOMER"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "id": "64df...",
    "name": "John Doe",
    "email": "john@example.com",
    "userId": "JOHND123",
    "userType": "CUSTOMER",
    "userStatus": "APPROVED"
  }
  ```

#### 2. Sign In
- **POST** `/crm/api/v1/auth/signin`
- **Body**:
  ```json
  {
    "userId": "JOHND123",
    "password": "Password123!"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "name": "John Doe",
    "userId": "JOHND123",
    "email": "john@example.com",
    "userType": "CUSTOMER",
    "userStatus": "APPROVED",
    "accessToken": "eyJhbGciOi..."
  }
  ```

---

### User Management Routes
*Note: All endpoints require the header `x-access-token: <your_jwt_token>`.*

#### 1. Get All Users (Admin Only)
- **GET** `/crm/api/v1/users`
- **Query Params (Optional)**: `userType` (`CUSTOMER` | `ENGINEER` | `ADMIN`), `userStatus` (`PENDING` | `APPROVED`)

#### 2. Get User By User ID
- **GET** `/crm/api/v1/users/:userId`

#### 3. Update User Details / Approve User
- **PUT** `/crm/api/v1/users/:userId`
- **Body**:
  ```json
  {
    "userStatus": "APPROVED",
    "userType": "ENGINEER"
  }
  ```

---

### Ticket Management Routes
*Note: All endpoints require the header `x-access-token: <your_jwt_token>`.*

#### 1. Create Ticket
- **POST** `/crm/api/v1/tickets`
- **Body**:
  ```json
  {
    "title": "Database connection issue",
    "description": "Getting timeout error when connecting to database",
    "ticketPriority": 1
  }
  ```
- **Response**: Ticket object with assigned `reporter` and auto-assigned `assignee`.

#### 2. Get All Tickets
- **GET** `/crm/api/v1/tickets`
  - Admin receives all tickets.
  - Engineer receives tickets assigned to them.
  - Customer receives tickets raised by them.

#### 3. Get Ticket By ID
- **GET** `/crm/api/v1/tickets/:id`

#### 4. Update Ticket
- **PUT** `/crm/api/v1/tickets/:id`
- **Body**:
  ```json
  {
    "status": "IN PROGRESS",
    "description": "Investigating server logs"
  }
  ```

---

## Data Models & Constants

### User Types
- `CUSTOMER`
- `ENGINEER`
- `ADMIN`

### User Statuses
- `PENDING`
- `APPROVED`

### Ticket Statuses
- `OPEN`
- `IN PROGRESS`
- `BLOCKED`
- `CLOSED`
