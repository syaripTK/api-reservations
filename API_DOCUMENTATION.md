# API Reservation System - Dokumentasi Endpoints

## Setup Awal (Wajib dilakukan)

```bash
# 1. Install dependencies
npm install

# 2. Update .env dengan JWT_SECRET
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=frontend-exam
DB_USER=root
DB_PASS=bismillah
DB_DIALECT=mysql
JWT_SECRET=your_secret_key_here
JWT_EXPIRED=24h

# 3. Run migrations
npx sequelize-cli db:migrate

# 4. (Opsional) Run seeders untuk test data
npx sequelize-cli db:seed

# 5. Start server
npm run dev
```

---

## API Structure

```
/api/v1
├── /auth           (Public)
├── /assets         (Protected)
├── /users          (Protected)
├── /admin          (Protected - Admin Only)
└── /reservations   (Protected)
```

---

## 1. AUTH MODULE

### Login

**POST** `/api/v1/auth/login`

- **Access**: Public
- **Body**:

```json
{
  "username": "string",
  "password": "string"
}
```

- **Response**:

```json
{
  "status": "success",
  "message": "Login berhasil",
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "username": "admin",
    "full_name": "Admin User",
    "role": "admin"
  }
}
```

### Get Profile (Me)

**GET** `/api/v1/auth/me`

- **Access**: Protected (JWT Required)
- **Headers**: `Authorization: Bearer <token>`
- **Response**:

```json
{
  "status": "success",
  "message": "Profil ditemukan",
  "data": {
    "id": 1,
    "username": "admin",
    "full_name": "Admin User",
    "role": "admin"
  }
}
```

---

## 2. ASSETS MODULE

### Get All Assets

**GET** `/api/v1/assets`

- **Access**: Protected
- **Query Parameters**:
  - `category_id` (optional): Filter by category
  - `status` (optional): 'available', 'booked', 'maintenance'
  - `page` (optional): default 1
  - `limit` (optional): default 10
- **Response**:

```json
{
  "status": "success",
  "message": "Daftar aset berhasil diambil",
  "data": [
    {
      "id": 1,
      "name": "Laptop Dell",
      "sku": "LAPTOP001",
      "status": "available",
      "image_url": "/uploads/image-file.jpg",
      "category": {
        "id": 1,
        "name": "Electronics"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### Get Asset Detail

**GET** `/api/v1/assets/:id`

- **Access**: Protected
- **Response**: Single asset object with category details

```json
{
  "status": "success",
  "message": "Detail aset berhasil diambil",
  "data": {
    "id": 1,
    "name": "Laptop Dell",
    "sku": "LAPTOP001",
    "status": "available",
    "description": "High-performance laptop",
    "image_url": "/uploads/image-file.jpg",
    "category": {
      "id": 1,
      "name": "Electronics"
    },
    "createdAt": "2026-04-16T10:00:00Z",
    "updatedAt": "2026-04-16T10:00:00Z"
  }
}
```

---

## 3. USERS MODULE

### Get My Reservations

**GET** `/api/v1/users/reservations`

- **Access**: Protected
- **Response**:

```json
{
  "status": "success",
  "message": "Riwayat reservasi berhasil diambil",
  "data": {
    "user": {
      "id": 2,
      "username": "john",
      "full_name": "John Doe",
      "role": "user"
    },
    "reservations": [
      {
        "id": 1,
        "asset_id": 5,
        "status": "approved",
        "request_date": "2026-04-16T10:00:00Z",
        "start_date": "2026-04-17T00:00:00Z",
        "end_date": "2026-04-20T00:00:00Z"
      }
    ]
  }
}
```

### Get User Profile

**GET** `/api/v1/users/:id`

- **Access**: Protected
- **Response**:

```json
{
  "status": "success",
  "message": "Detail user berhasil diambil",
  "data": {
    "id": 2,
    "username": "john",
    "full_name": "John Doe",
    "role": "user",
    "createdAt": "2026-04-16T10:00:00Z",
    "updatedAt": "2026-04-16T10:00:00Z"
  }
}
```

### Update Profile

**PUT** `/api/v1/users/profile`

- **Access**: Protected
- **Body**:

```json
{
  "full_name": "New Name",
  "password": "new_password"
}
```

---

## 4. ADMIN MODULE

### 🔴 ALL ADMIN ENDPOINTS REQUIRE ADMIN ROLE

### Get All Assets (Admin View)

**GET** `/api/v1/admin/assets`

- **Access**: Protected - Admin Only
- **Query**: Same as regular assets endpoint

### Get Asset Detail (Admin View)

**GET** `/api/v1/admin/assets/:id`

- **Access**: Protected - Admin Only
- **Response**: Single asset object with category details

### Create Asset

**POST** `/api/v1/admin/assets`

- **Access**: Protected - Admin Only
- **Content-Type**: `multipart/form-data`
- **Body**:

```
name: string
sku: string
category_id: integer
description: string (optional)
image: file (optional, jpg/png/jpeg, max 5MB)
```

- **Response**: Created asset object

### Update Asset

**PUT** `/api/v1/admin/assets/:id`

- **Access**: Protected - Admin Only
- **Body**: Same as create (all optional)
- **Can update status**: 'available', 'booked', 'maintenance'

### Delete Asset

**DELETE** `/api/v1/admin/assets/:id`

- **Access**: Protected - Admin Only
- **Response**:

```json
{
  "status": "success",
  "message": "Aset berhasil dihapus"
}
```

### Get All Categories

**GET** `/api/v1/admin/categories`

- **Access**: Protected - Admin Only

### Get Category Detail

**GET** `/api/v1/admin/categories/:id`

- **Access**: Protected - Admin Only
- **Includes**: List of assets in category

### Create Category

**POST** `/api/v1/admin/categories`

- **Access**: Protected - Admin Only
- **Body**:

```json
{
  "name": "Electronics",
  "description": "Electronic devices"
}
```

### Update Category

**PUT** `/api/v1/admin/categories/:id`

- **Access**: Protected - Admin Only
- **Body**: Same as create (all optional)

### Delete Category

**DELETE** `/api/v1/admin/categories/:id`

- **Access**: Protected - Admin Only

### Get All Users

**GET** `/api/v1/admin/users`

- **Access**: Protected - Admin Only
- **Query Parameters**:
  - `role` (optional): Filter by role ('admin' or 'user')
  - `page` (optional): default 1
  - `limit` (optional): default 10
- **Response**:

```json
{
  "status": "success",
  "message": "Daftar user berhasil diambil",
  "data": [
    {
      "id": 2,
      "username": "john",
      "full_name": "John Doe",
      "role": "user",
      "createdAt": "2026-04-16T10:00:00Z",
      "updatedAt": "2026-04-16T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 5,
    "itemsPerPage": 10
  }
}
```

### Get User Detail

**GET** `/api/v1/admin/users/:id`

- **Access**: Protected - Admin Only
- **Response**:

```json
{
  "status": "success",
  "message": "Detail user berhasil diambil",
  "data": {
    "id": 2,
    "username": "john",
    "full_name": "John Doe",
    "role": "user",
    "reservations": [
      {
        "id": 1,
        "status": "approved",
        "start_date": "2026-04-17T00:00:00Z",
        "end_date": "2026-04-20T00:00:00Z"
      }
    ]
  }
}
```

### Create User

**POST** `/api/v1/admin/users`

- **Access**: Protected - Admin Only
- **Body**:

```json
{
  "username": "newuser",
  "full_name": "New User Name",
  "password": "password123",
  "role": "user"
}
```

- **Validation**:
  - `username`: Required, minimum 3 characters, must be unique
  - `full_name`: Required
  - `password`: Required, minimum 6 characters (will be hashed with bcrypt)
  - `role`: Optional, default 'user' (can be 'admin' or 'user')
- **Response**: Created user object (password excluded)

```json
{
  "status": "success",
  "message": "User berhasil dibuat",
  "data": {
    "id": 3,
    "username": "newuser",
    "full_name": "New User Name",
    "role": "user"
  }
}
```

### Update User

**PUT** `/api/v1/admin/users/:id`

- **Access**: Protected - Admin Only
- **Body** (all optional):

```json
{
  "username": "updatedusername",
  "full_name": "Updated Full Name",
  "role": "admin"
}
```

- **Validation**:
  - `username`: Minimum 3 characters, must be unique (if changed)
  - `full_name`: Cannot be empty (if provided)
  - `role`: Must be 'admin' or 'user' (if provided)
- **Response**: Updated user object

```json
{
  "status": "success",
  "message": "User berhasil diperbarui",
  "data": {
    "id": 2,
    "username": "updatedusername",
    "full_name": "Updated Full Name",
    "role": "admin"
  }
}
```

### Delete User

**DELETE** `/api/v1/admin/users/:id`

- **Access**: Protected - Admin Only
- **Response**:

```json
{
  "status": "success",
  "message": "User berhasil dihapus"
}
```

---

## 5. RESERVATIONS MODULE

### Create Reservation (Request Peminjaman)

**POST** `/api/v1/reservations`

- **Access**: Protected (User or Admin)
- **Body**:

```json
{
  "asset_id": 5,
  "start_date": "2026-04-17T00:00:00Z",
  "end_date": "2026-04-20T00:00:00Z"
}
```

- **Behavior**:
  - ✅ Status awal peminjaman: "pending"
  - ✅ Status aset berubah menjadi: "booked"
  - ✅ Menggunakan Sequelize Transaction untuk atomisitas
- **Response**:

```json
{
  "status": "success",
  "message": "Permintaan peminjaman berhasil dibuat. Menunggu persetujuan admin.",
  "data": {
    "id": 1,
    "user_id": 2,
    "asset_id": 5,
    "status": "pending",
    "start_date": "2026-04-17T00:00:00Z",
    "end_date": "2026-04-20T00:00:00Z"
  }
}
```

### Get My Reservations

**GET** `/api/v1/reservations/my-reservations`

- **Access**: Protected
- **Response**: List peminjaman user dengan detail aset

### Get Reservation Detail

**GET** `/api/v1/reservations/:id`

- **Access**: Protected (User can access their own, Admin can access all)
- **Response**:

```json
{
  "status": "success",
  "message": "Detail peminjaman berhasil diambil",
  "data": {
    "id": 1,
    "status": "pending",
    "start_date": "2026-04-17T00:00:00Z",
    "end_date": "2026-04-20T00:00:00Z",
    "request_date": "2026-04-16T10:00:00Z",
    "user": {
      "id": 2,
      "username": "john",
      "full_name": "John Doe"
    },
    "asset": {
      "id": 5,
      "name": "Laptop Dell",
      "sku": "LAPTOP001",
      "status": "booked"
    }
  }
}
```

### Admin: Get All Reservations

**GET** `/api/v1/reservations`

- **Access**: Protected - Admin Only
- **Query**:
  - `status` (optional): 'pending', 'approved', 'rejected', 'returned'
  - `page`, `limit` (optional)
- **Response**: List semua peminjaman dengan detail user & aset

### Admin: Approve Reservation

**PUT** `/api/v1/reservations/:id/approve`

- **Access**: Protected - Admin Only
- **Behavior**: Status berubah dari "pending" → "approved"
- **Aset tetap**: "booked"

### Admin: Reject Reservation

**PUT** `/api/v1/reservations/:id/reject`

- **Access**: Protected - Admin Only
- **Behavior**:
  - Status berubah dari "pending" → "rejected"
  - ✅ Aset berubah kembali menjadi: "available"
  - ✅ Menggunakan Sequelize Transaction
- **Response**: Updated reservation object

### User/Admin: Return Asset

**PUT** `/api/v1/reservations/:id/return`

- **Access**: Protected (User yang meminjam atau Admin)
- **Behavior**:
  - Status berubah dari "approved" → "returned"
  - ✅ Aset berubah kembali menjadi: "available"
  - ✅ Menggunakan Sequelize Transaction
- **Response**: Updated reservation object

---

## Role-Based Access Control (RBAC)

| Endpoint                                | User | Admin |
| --------------------------------------- | ---- | ----- |
| Auth (Login, Get Profile)               | ✅   | ✅    |
| Assets (GET)                            | ✅   | ✅    |
| Reservations (Create, Get My)           | ✅   | ✅    |
| Reservations (Return)                   | ✅   | ✅    |
| Reservations (Get All, Approve, Reject) | ❌   | ✅    |
| Admin (Assets CRUD)                     | ❌   | ✅    |
| Admin (Categories CRUD)                 | ❌   | ✅    |
| Admin (Users CRUD)                      | ❌   | ✅    |

---

## Error Handling

Semua error mengikuti format berikut:

```json
{
  "status": "error",
  "message": "Deskripsi error",
  "errors": [
    // optional, untuk validation error
    {
      "field": "username",
      "message": "Username harus diisi"
    }
  ]
}
```

---

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request / Validation Error
- `401`: Unauthorized (Token invalid/missing)
- `403`: Forbidden (Tidak punya akses/role)
- `404`: Not Found
- `500`: Internal Server Error

---

## Key Features Implemented

✅ JWT Authentication dengan Role-Based Access Control  
✅ Sequelize Transaction untuk Reservations atomicity  
✅ File Upload dengan Multer (image validation)  
✅ Request Validation dengan express-validator  
✅ Rate Limiting untuk endpoint login  
✅ Consistent Response Format  
✅ Comprehensive Error Handling  
✅ Asset Status Management (available → booked → available/returned)  
✅ Pagination untuk list endpoints  
✅ CORS support

---

## Tech Stack

- **Node.js** + **Express.js**
- **Sequelize** ORM dengan MySQL
- **JWT** untuk authentication
- **bcrypt** untuk password hashing
- **Multer** untuk file upload
- **express-validator** untuk request validation
- **express-rate-limit** untuk rate limiting
