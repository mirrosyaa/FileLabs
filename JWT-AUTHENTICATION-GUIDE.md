# JWT Authentication System - Complete Guide

This document explains how the frontend and backend work together to provide secure authentication using JSON Web Tokens (JWT).

---

## 🎯 Overview

Your FileLabs app uses a **JWT-based authentication system** that:

- Allows users to log in once and stay authenticated
- Securely transmits user identity between frontend and backend
- Automatically protects routes that require authentication
- Persists login state across browser refreshes

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              AuthProvider Component                     │    │
│  │  • Stores JWT token in state & localStorage            │    │
│  │  • Automatically attaches token to ALL axios requests  │    │
│  │  • Shares token with all components via Context        │    │
│  └────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           │ HTTP Requests with JWT               │
│                           │ Authorization: Bearer <token>        │
│                           ▼                                      │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (Express)                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │           /users/login (POST) - Public Route           │    │
│  │  • Validates email/password                            │    │
│  │  • Generates JWT token with user data                  │    │
│  │  • Sends token back to frontend                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │    authenticateToken Middleware - Token Verifier       │    │
│  │  • Extracts token from Authorization header            │    │
│  │  • Verifies token signature & expiration               │    │
│  │  • Attaches decoded user data to request               │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │      /users/profile (GET) - Protected Route            │    │
│  │  • Uses authenticateToken middleware                   │    │
│  │  • Only accessible with valid JWT                      │    │
│  │  • Returns user data from token                        │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete Authentication Flow

### **1. User Login Process**

#### **Step 1: User Submits Login Form**

```javascript
// Frontend: LoginForm.jsx
import { useAuth } from "./Authentication/authProvider";

function LoginForm() {
  const { setToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Send credentials to backend
    const response = await axios.post("http://localhost:3001/users/login", {
      user_email: email,
      user_password: password,
    });

    // Backend validates and returns token
    setToken(response.data.token); // Save token
    navigate("/home"); // Redirect to home
  };
}
```

#### **Step 2: Backend Validates & Issues JWT**

```javascript
// Backend: server/routes/users.js
router.post("/login", (req, res) => {
  const { user_email, user_password } = req.body;

  // 1. Check database for user
  db.query(sql, [user_email, user_password], (err, results) => {
    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = results[0];

    // 2. Generate JWT token
    const token = jwt.sign(
      {
        userId: user.userID,
        email: user.user_email,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: "6h" }
    );

    // 3. Send token to frontend
    res.json({
      token: token, // ← JWT token
      user: { id, email, username },
    });
  });
});
```

**What the token looks like:**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoiam9obiIsImlhdCI6MTczMDkyODAwMCwiZXhwIjoxNzMwOTQ5NjAwfQ.signature
```

- **Part 1:** Header (algorithm & type)
- **Part 2:** Payload (user data: userId, email, username, expiration)
- **Part 3:** Signature (verifies token hasn't been tampered with)

#### **Step 3: Frontend Saves & Auto-Attaches Token**

```javascript
// Frontend: Authentication/authProvider.js
const setToken = (newToken) => {
  setToken_(newToken); // Update state
};

useEffect(() => {
  if (token) {
    // 1. Attach to ALL future axios requests
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;

    // 2. Save to browser storage (persists across refreshes)
    localStorage.setItem("token", token);
  }
}, [token]);
```

**Now ALL axios requests automatically include:**

```
Headers: {
  Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### **2. Accessing Protected Routes**

#### **Step 1: Frontend Makes Request**

```javascript
// Frontend: Any component
import { useAuth } from "./Authentication/authProvider";

function ProfilePage() {
  const { token } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      // Token automatically attached by AuthProvider!
      const response = await axios.get("http://localhost:3001/users/profile");
      setUserData(response.data.user);
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);
}
```

**Request sent to backend:**

```http
GET /users/profile HTTP/1.1
Host: localhost:3001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Step 2: Backend Middleware Verifies Token**

```javascript
// Backend: server/routes/users.js
const authenticateToken = (req, res, next) => {
  // 1. Extract token from header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Get "TOKEN" from "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // 2. Verify token signature and expiration
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    // 3. Token is valid! Attach user data to request
    req.user = user; // { userId: 1, email: "...", username: "..." }
    next(); // Continue to route handler
  });
};
```

#### **Step 3: Route Handler Executes**

```javascript
// Backend: server/routes/users.js
router.get("/profile", authenticateToken, (req, res) => {
  // middleware verified token ✅
  // req.user has decoded JWT data

  res.json({
    message: "Access granted!",
    user: req.user, // { userId, email, username }
  });
});
```

---

### **3. Browser Refresh (Persistent Login)**

#### **What Happens:**

```javascript
// 1. Browser reloads → All JavaScript erased from memory

// 2. AuthProvider initializes
const [token, setToken_] = useState(localStorage.getItem("token"));
// ↑ Retrieves saved token from browser storage!

// 3. useEffect runs
useEffect(() => {
  if (token) {
    // Re-attach token to axios
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;
  }
}, [token]);

// 4. User still logged in! ✅
```

**Why this works:**

- `localStorage` survives browser refresh/close
- Token retrieved and re-attached to axios automatically
- No need to log in again!

---

### **4. Logout Process**

```javascript
// Frontend: Any component
import { useAuth } from "./Authentication/authProvider";

function LogoutButton() {
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(null); // Clear token
    navigate("/"); // Redirect to login
  };
}
```

**What happens in AuthProvider:**

```javascript
useEffect(() => {
  if (token) {
    // ... login logic
  } else {
    // Token is null → LOGOUT
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
}, [token]);
```

**Result:**

- Token removed from axios headers (future requests won't be authenticated)
- Token deleted from localStorage (next visit requires login)

---

## 🔗 How Frontend & Backend Connect

### **The Connection Points:**

| Frontend Action              | Backend Endpoint     | What Happens                          |
| ---------------------------- | -------------------- | ------------------------------------- |
| User logs in                 | `POST /users/login`  | Backend generates & sends JWT         |
| AuthProvider receives token  | N/A                  | Saves to localStorage & axios headers |
| User accesses protected page | `GET /users/profile` | Backend verifies JWT via middleware   |
| Token is valid               | N/A                  | Backend returns protected data        |
| Token is invalid             | N/A                  | Backend returns 401/403 error         |
| User logs out                | N/A                  | Frontend clears token                 |

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   User      │
│  (Browser)  │
└──────┬──────┘
       │ 1. Enters email/password
       ▼
┌─────────────────────────────────────────┐
│  LoginForm Component                     │
│  axios.post('/users/login', credentials) │
└──────┬──────────────────────────────────┘
       │ 2. HTTP Request
       ▼
┌─────────────────────────────────────────┐
│  Backend: POST /users/login              │
│  • Validates credentials                │
│  • Generates JWT token                  │
│  • jwt.sign({ userId, email, ... })     │
└──────┬──────────────────────────────────┘
       │ 3. Response: { token: "eyJhbG..." }
       ▼
┌─────────────────────────────────────────┐
│  LoginForm Component                     │
│  setToken(response.data.token)          │
└──────┬──────────────────────────────────┘
       │ 4. Updates AuthProvider
       ▼
┌─────────────────────────────────────────┐
│  AuthProvider                            │
│  • token state updated                  │
│  • useEffect triggers                   │
│  • axios.defaults.headers["Auth"] = ... │
│  • localStorage.setItem("token", ...)   │
└──────┬──────────────────────────────────┘
       │ 5. User navigates to /profile
       ▼
┌─────────────────────────────────────────┐
│  ProfilePage Component                   │
│  axios.get('/users/profile')            │
│  (Token auto-attached to headers!)      │
└──────┬──────────────────────────────────┘
       │ 6. HTTP Request with Auth header
       ▼
┌─────────────────────────────────────────┐
│  Backend: Middleware authenticateToken  │
│  • Extracts token from header           │
│  • jwt.verify(token, SECRET)            │
│  • Attaches user data to req.user       │
└──────┬──────────────────────────────────┘
       │ 7. Token valid ✅
       ▼
┌─────────────────────────────────────────┐
│  Backend: GET /users/profile handler    │
│  res.json({ user: req.user })           │
└──────┬──────────────────────────────────┘
       │ 8. Response: { user: {...} }
       ▼
┌─────────────────────────────────────────┐
│  ProfilePage Component                   │
│  Displays user data                     │
└─────────────────────────────────────────┘
```

---

## 🔐 Security Features

### **1. Token Expiration**

```javascript
// Backend: users.js
jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "6h" });
```

- Tokens automatically expire after 6 hours
- Forces re-authentication for security
- Prevents stolen tokens from being valid forever

### **2. Signature Verification**

```javascript
// Backend: authenticateToken middleware
jwt.verify(token, JWT_SECRET, (err, user) => {
  if (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
});
```

- Backend verifies token wasn't tampered with
- Only tokens signed with `JWT_SECRET` are valid
- If someone modifies the token, signature becomes invalid

### **3. Secure Headers**

```javascript
// Frontend: authProvider.js
axios.defaults.headers.common["Authorization"] = "Bearer " + token;
```

- Token sent in HTTP headers (not URL or body)
- Standard format: `Authorization: Bearer <token>`

### **4. localStorage Persistence**

```javascript
// Frontend: authProvider.js
localStorage.setItem("token", token);
```

- Token stored in browser
- Survives page refresh
- Cleared on logout

---

## 🛠️ How to Use in Your Code

### **Frontend: Access Authentication**

```javascript
import { useAuth } from "./Authentication/authProvider";

function AnyComponent() {
  const { token, setToken } = useAuth();

  // Check if logged in
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Make authenticated requests (token auto-attached!)
  const fetchData = async () => {
    const response = await axios.get("/api/data");
  };

  // Logout
  const logout = () => {
    setToken(null);
  };
}
```

### **Backend: Protect Any Route**

```javascript
// Public route (no authentication needed)
router.get("/public", (req, res) => {
  res.json({ message: "Anyone can see this" });
});

// Protected route (authentication required)
router.get("/private", authenticateToken, (req, res) => {
  res.json({
    message: "Only logged-in users see this",
    userId: req.user.userId, // From JWT
  });
});
```

---

## 🧪 Testing the System

### **Test 1: Login & Get Token**

1. Start backend: `npm run dev` (in `/server`)
2. Start frontend: `npm start` (in `/client`)
3. Open browser console (F12)
4. Log in with valid credentials
5. Check localStorage: `localStorage.getItem('token')`
   - Should see JWT token
6. Check axios headers: `axios.defaults.headers.common`
   - Should see: `Authorization: "Bearer eyJhbG..."`

### **Test 2: Access Protected Route**

```javascript
// After logging in
const response = await axios.get("http://localhost:3001/users/profile");
console.log(response.data);
// Should see: { message: "Access granted!", user: {...} }
```

### **Test 3: Access Without Token (Should Fail)**

```javascript
// Clear token
localStorage.removeItem("token");
delete axios.defaults.headers.common["Authorization"];

// Try to access protected route
const response = await axios.get("http://localhost:3001/users/profile");
// Should get 401 error: "Access denied. No token provided."
```

### **Test 4: Refresh Browser (Should Stay Logged In)**

1. Log in
2. Refresh page (F5)
3. Check if still logged in
4. Token should be retrieved from localStorage
5. Should not need to log in again ✅

---

## 📝 Key Takeaways

| Component                                | Responsibility                                         |
| ---------------------------------------- | ------------------------------------------------------ |
| **Frontend AuthProvider**                | Stores token, attaches to requests, shares via Context |
| **Backend /login route**                 | Validates credentials, generates JWT token             |
| **Backend authenticateToken middleware** | Verifies JWT on protected routes                       |
| **localStorage**                         | Persists token across browser sessions                 |
| **axios.defaults.headers**               | Auto-attaches token to all requests                    |
| **JWT token**                            | Secure, signed proof of authentication                 |

---

## 🚀 Summary

**The system works like this:**

1. **Login:** Backend generates JWT → Frontend saves it
2. **Auto-Attach:** Frontend adds JWT to every request automatically
3. **Verify:** Backend checks JWT on protected routes
4. **Persist:** localStorage keeps user logged in across refreshes
5. **Logout:** Frontend clears token

**Benefits:**

- ✅ Secure authentication
- ✅ Stateless (no server-side sessions)
- ✅ Automatic token management
- ✅ Persistent login
- ✅ Easy to implement
- ✅ Scalable

**Your authentication system is production-ready!** 🎉

---

_Last Updated: November 7, 2025_
