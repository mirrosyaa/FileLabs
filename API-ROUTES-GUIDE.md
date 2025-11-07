# FileLabs API Routes Documentation

Complete guide to all available API endpoints, including request/response structures and examples.

**Base URL:** `http://localhost:3001`

---

## 📑 Table of Contents

1. [Authentication Routes](#authentication-routes)
   - [Login](#1-login)
   - [Register User (Admin Only)](#2-register-user-admin-only)
2. [User Profile Routes](#user-profile-routes)
   - [Get Profile](#3-get-user-profile)
   - [Update Profile](#4-update-profile)
   - [Change Password](#5-change-password)
   - [Delete Account](#6-delete-account)
3. [Admin Routes](#admin-routes)
   - [Delete Any User](#7-admin-delete-any-user)

---

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Routes

### 1. Login

Login with email and password to receive a JWT token.

**Endpoint:** `POST /users/login`  
**Authentication:** ❌ Not required  
**Who can access:** Anyone

#### Request

```json
{
  "user_email": "john@example.com",
  "user_password": "password123"
}
```

#### Success Response (200 OK)

```json
{
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsInVzZXJUeXBlIjoidXNlciIsImlhdCI6MTczMDkyODAwMCwiZXhwIjoxNzMwOTQyNDAwfQ.signature",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "username": "john_doe",
    "created_at": "2025-11-07T10:30:00.000Z",
    "userType": "user"
  }
}
```

#### Error Responses

**400 Bad Request** - Missing fields

```json
{
  "message": "Email and password are required."
}
```

**401 Unauthorized** - Invalid credentials

```json
{
  "message": "Invalid email or password"
}
```

**500 Internal Server Error** - Database error

```json
{
  "message": "Internal server error"
}
```

---

### 2. Register User (Admin Only)

Create a new user account. Only admins can register new users.

**Endpoint:** `POST /users/register`  
**Authentication:** ✅ Required (Admin only)  
**Who can access:** Admin users only

#### Request Headers

```
Authorization: Bearer <admin-jwt-token>
```

#### Request Body

```json
{
  "username": "jane_smith",
  "user_email": "jane@example.com",
  "user_password": "securePassword456",
  "user_type": "user"
}
```

**Fields:**

- `username` (required): Unique username
- `user_email` (required): Unique email address
- `user_password` (required): User password (plain text - should be hashed in production)
- `user_type` (optional): User role (`'user'`, `'admin'`, `'moderator'`) - defaults to `'user'`

#### Success Response (201 Created)

```json
{
  "message": "User created successfully!",
  "userId": 5
}
```

#### Error Responses

**400 Bad Request** - Missing required fields

```json
{
  "message": "Username, email, and password are required."
}
```

**401 Unauthorized** - No token provided

```json
{
  "message": "Access denied. No token provided."
}
```

**403 Forbidden** - Not an admin

```json
{
  "message": "Access denied. Admin privileges required."
}
```

**409 Conflict** - Email already exists

```json
{
  "message": "Email already registered"
}
```

**409 Conflict** - Username already exists

```json
{
  "message": "Username already taken"
}
```

**500 Internal Server Error** - Database error

```json
{
  "message": "Server error - is the database connected?"
}
```

---

## User Profile Routes

### 3. Get User Profile

Retrieve the current logged-in user's profile information.

**Endpoint:** `GET /users/profile`  
**Authentication:** ✅ Required  
**Who can access:** Any authenticated user

#### Request Headers

```
Authorization: Bearer <your-jwt-token>
```

#### Success Response (200 OK)

```json
{
  "user": {
    "userID": 1,
    "username": "john_doe",
    "user_email": "john@example.com",
    "user_type": "user",
    "created_at": "2025-11-07T10:30:00.000Z"
  }
}
```

#### Error Responses

**401 Unauthorized** - No token provided

```json
{
  "message": "Access denied. No token provided."
}
```

**403 Forbidden** - Invalid token

```json
{
  "message": "Invalid or expired token."
}
```

**404 Not Found** - User not found

```json
{
  "message": "User not found"
}
```

**500 Internal Server Error** - Database error

```json
{
  "message": "Server error"
}
```

---

### 4. Update Profile

Update username and/or email for the current user.

**Endpoint:** `PUT /users/profile`  
**Authentication:** ✅ Required  
**Who can access:** Any authenticated user (updates own profile)

#### Request Headers

```
Authorization: Bearer <your-jwt-token>
```

#### Request Body

```json
{
  "username": "john_updated",
  "user_email": "john_new@example.com"
}
```

**Fields:**

- `username` (optional): New username
- `user_email` (optional): New email address
- **Note:** At least one field must be provided

#### Success Response (200 OK)

```json
{
  "message": "Profile updated successfully",
  "updated": {
    "username": "john_updated",
    "user_email": "john_new@example.com"
  }
}
```

#### Error Responses

**400 Bad Request** - No fields provided

```json
{
  "message": "Provide at least one field to update (username or email)"
}
```

**401 Unauthorized** - No token provided

```json
{
  "message": "Access denied. No token provided."
}
```

**403 Forbidden** - Invalid token

```json
{
  "message": "Invalid or expired token."
}
```

**404 Not Found** - User not found

```json
{
  "message": "User not found"
}
```

**409 Conflict** - Username or email already taken

```json
{
  "message": "Username or email already taken"
}
```

**500 Internal Server Error** - Database error

```json
{
  "message": "Error updating profile"
}
```

---

### 5. Change Password

Change the current user's password.

**Endpoint:** `POST /users/change-password`  
**Authentication:** ✅ Required  
**Who can access:** Any authenticated user

#### Request Headers

```
Authorization: Bearer <your-jwt-token>
```

#### Request Body

```json
{
  "oldPassword": "currentPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Fields:**

- `oldPassword` (required): Current password for verification
- `newPassword` (required): New password to set

#### Success Response (200 OK)

```json
{
  "message": "Password updated successfully!"
}
```

#### Error Responses

**400 Bad Request** - Missing fields

```json
{
  "message": "Current password and new password are required"
}
```

**401 Unauthorized** - No token or incorrect current password

```json
{
  "message": "Current password is incorrect"
}
```

**403 Forbidden** - Invalid token

```json
{
  "message": "Invalid or expired token."
}
```

**404 Not Found** - User not found

```json
{
  "message": "User not found"
}
```

**500 Internal Server Error** - Database error

```json
{
  "message": "Server error - likely SQL error"
}
```

---

### 6. Delete Account

Delete the current user's account (requires password confirmation).

**Endpoint:** `DELETE /users/account`  
**Authentication:** ✅ Required  
**Who can access:** Any authenticated user (deletes own account)

#### Request Headers

```
Authorization: Bearer <your-jwt-token>
```

#### Request Body

```json
{
  "password": "password123"
}
```

**Fields:**

- `password` (required): Current password for confirmation

#### Success Response (200 OK)

```json
{
  "message": "Account deleted successfully",
  "deletedUserId": 1
}
```

#### Error Responses

**400 Bad Request** - No password provided

```json
{
  "message": "Password confirmation required to delete account"
}
```

**401 Unauthorized** - No token or incorrect password

```json
{
  "message": "Incorrect password"
}
```

**403 Forbidden** - Invalid token

```json
{
  "message": "Invalid or expired token."
}
```

**404 Not Found** - User not found

```json
{
  "message": "User not found"
}
```

**500 Internal Server Error** - Database error

```json
{
  "message": "Server error"
}
```

---

## Admin Routes

### 7. Admin: Delete Any User

Admin endpoint to delete any user by their ID.

**Endpoint:** `DELETE /users/admin/user/:userId`  
**Authentication:** ✅ Required (Admin only)  
**Who can access:** Admin users only

#### Request Headers

```
Authorization: Bearer <admin-jwt-token>
```

#### URL Parameters

- `userId` (required): The ID of the user to delete

#### Example Request

```
DELETE /users/admin/user/5
```

#### Success Response (200 OK)

```json
{
  "message": "User deleted successfully",
  "deletedUserId": "5"
}
```

#### Error Responses

**401 Unauthorized** - No token provided

```json
{
  "message": "Access denied. No token provided."
}
```

**403 Forbidden** - Not an admin

```json
{
  "message": "Access denied. Admin privileges required."
}
```

**404 Not Found** - User not found

```json
{
  "message": "User not found"
}
```

**500 Internal Server Error** - Database error

```json
{
  "message": "Error deleting user"
}
```

---

## 📊 HTTP Status Codes Summary

| Code | Meaning               | When Used                                 |
| ---- | --------------------- | ----------------------------------------- |
| 200  | OK                    | Successful GET, PUT, DELETE               |
| 201  | Created               | Successful POST (user created)            |
| 400  | Bad Request           | Missing required fields                   |
| 401  | Unauthorized          | No token or invalid credentials           |
| 403  | Forbidden             | Invalid token or insufficient permissions |
| 404  | Not Found             | Resource doesn't exist                    |
| 409  | Conflict              | Duplicate username/email                  |
| 500  | Internal Server Error | Database or server error                  |

---

## 🧪 Testing Examples

### Using cURL

#### Login

```bash
curl -X POST http://localhost:3001/users/login \
  -H "Content-Type: application/json" \
  -d '{"user_email":"john@example.com","user_password":"password123"}'
```

#### Get Profile

```bash
curl -X GET http://localhost:3001/users/profile \
  -H "Authorization: Bearer <your-token>"
```

#### Register User (Admin)

```bash
curl -X POST http://localhost:3001/users/register \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","user_email":"new@example.com","user_password":"pass123"}'
```

### Using JavaScript (Axios)

#### Login

```javascript
const response = await axios.post("http://localhost:3001/users/login", {
  user_email: "john@example.com",
  user_password: "password123",
});

const token = response.data.token;
```

#### Get Profile

```javascript
const response = await axios.get("http://localhost:3001/users/profile", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

console.log(response.data.user);
```

#### Update Profile

```javascript
const response = await axios.put(
  "http://localhost:3001/users/profile",
  {
    username: "john_updated",
    user_email: "john_new@example.com",
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
```

---

## 🔑 JWT Token Structure

When you log in, you receive a JWT token that contains:

```json
{
  "userId": 1,
  "email": "john@example.com",
  "username": "john_doe",
  "userType": "user",
  "iat": 1730928000,
  "exp": 1730942400
}
```

**Fields:**

- `userId` - User's database ID
- `email` - User's email
- `username` - User's username
- `userType` - User's role (`'user'`, `'admin'`, `'moderator'`)
- `iat` - Issued at timestamp
- `exp` - Expiration timestamp (4 hours from login)

---

## 🛡️ Security Notes

### For Production:

1. **Hash Passwords** - Use bcrypt to hash passwords before storing
2. **Environment Variables** - Move JWT_SECRET to `.env` file
3. **HTTPS** - Use HTTPS in production
4. **Rate Limiting** - Implement rate limiting on login route
5. **Input Validation** - Add validation library (e.g., Joi)
6. **SQL Injection Prevention** - Already using parameterized queries ✅

---

## 📝 Quick Reference

| Endpoint                    | Method | Auth | Admin Only | Purpose            |
| --------------------------- | ------ | ---- | ---------- | ------------------ |
| `/users/login`              | POST   | ❌   | ❌         | Login              |
| `/users/register`           | POST   | ✅   | ✅         | Create user        |
| `/users/profile`            | GET    | ✅   | ❌         | Get profile        |
| `/users/profile`            | PUT    | ✅   | ❌         | Update profile     |
| `/users/change-password`    | POST   | ✅   | ❌         | Change password    |
| `/users/account`            | DELETE | ✅   | ❌         | Delete own account |
| `/users/admin/user/:userId` | DELETE | ✅   | ✅         | Delete any user    |

---

_Last Updated: November 7, 2025_
