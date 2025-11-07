# JWT Authentication Guide - For Beginners 🔐

A simple guide to understanding how login works in your FileLabs app.

---

## 🎯 What is JWT?

**JWT = Your Digital ID Badge**

Think of it like a **concert wristband**:
1. Show your ticket at the entrance → **Login with email/password**
2. Get a wristband → **Receive JWT token**
3. Show wristband to enter any area → **Token attached to requests**
4. Security checks wristband → **Backend verifies token**
5. Wristband expires after the concert → **Token expires after 6 hours**

---

## 🏗️ How It Works

```
FRONTEND (React)                 BACKEND (Node.js)
─────────────────                ──────────────────

1. User enters login       →     Checks database
2. Receives JWT token      ←     Creates token
3. Saves token                   
4. Auto-attaches to requests →   Verifies token
5. Gets data               ←     Returns data
```

---

## 🔙 Backend (Node.js)

### **File: `server/routes/users.js`**

#### **1. Login - Give User a Token**

```javascript
router.post("/login", (req, res) => {
  // Check if email/password correct
  db.query("SELECT * FROM users WHERE email = ? AND password = ?");
  
  // If correct, create token
  const token = jwt.sign(
    { userId: 1, email: "user@example.com" },  // User info
    "secret-key",                               // Password to sign it
    { expiresIn: "6h" }                        // Valid for 6 hours
  );
  
  // Send token to frontend
  res.json({ token: token });
});
```

**Simple terms:** "Password correct? Here's your wristband (token)!"

---

#### **2. Middleware - Check Token**

```javascript
const authenticateToken = (req, res, next) => {
  // Get token from request
  const token = req.headers['authorization'].split(' ')[1];
  
  // No token? Kick them out
  if (!token) {
    return res.status(401).json({ message: "No token!" });
  }
  
  // Verify token is real and not expired
  jwt.verify(token, "secret-key", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token!" });
    }
    
    req.user = user;  // Save user info
    next();           // Let them through
  });
};
```

**Simple terms:** "Show me your wristband. Is it real? Not expired? OK, enter!"

---

#### **3. Protected Route - Requires Token**

```javascript
router.get("/profile", authenticateToken, (req, res) => {
  // authenticateToken checked the token first ↑
  // If they made it here, token is valid
  
  res.json({ user: req.user });
});
```

**Simple terms:** "Can only access this if you have a valid wristband."

---

## ⚛️ Frontend (React)

### **File: `client/src/Authentication/authProvider.js`**

#### **AuthProvider - Stores the Token**

```javascript
// Stores token
const [token, setToken] = useState(localStorage.getItem("token"));

// When token changes
useEffect(() => {
  if (token) {
    // Save to browser (survives refresh)
    localStorage.setItem("token", token);
    
    // Attach to ALL requests automatically
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;
  } else {
    // Remove token (logout)
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  }
}, [token]);
```

**Simple terms:** 
- Keeps your wristband safe
- Shows it automatically at every door

---

### **File: `client/src/components/loginForm.jsx`**

#### **LoginForm - Get Token from Backend**

```javascript
const { setToken } = useAuth();

const handleSubmit = async (e) => {
  // Send email/password to backend
  const response = await axios.post('/users/login', {
    email: email,
    password: password
  });
  
  // Got token! Save it
  setToken(response.data.token);
  
  // Go to home page
  navigate('/home');
};
```

**Simple terms:** "Send credentials, get wristband, save it, enter venue!"

---

### **File: `client/src/components/RouteProtector.jsx`**

#### **RouteProtector - Guards Pages**

```javascript
const RouteProtector = ({ children }) => {
  const { token } = useAuth();
  
  // No token? Go to login
  if (!token) {
    return <Navigate to="/" />;
  }
  
  // Has token? Show the page
  return children;
};
```

**Simple terms:** "Have wristband? Come in. No wristband? Get one first!"

---

### **File: `client/src/App.js`**

#### **Using RouteProtector**

```javascript
<Routes>
  {/* Anyone can access */}
  <Route path="/" element={<LoginPage />} />
  
  {/* Need token to access */}
  <Route 
    path="/home" 
    element={
      <RouteProtector>
        <HomePage />
      </RouteProtector>
    } 
  />
</Routes>
```

---

## 🔄 Complete Flow (Step by Step)

### **Login:**
```
1. User enters email/password → LoginForm
2. LoginForm sends to backend → POST /users/login
3. Backend checks database → "Credentials correct!"
4. Backend creates JWT token → "Here's your wristband"
5. Frontend saves token → localStorage + axios headers
6. User redirected to /home → ✅ Logged in!
```

### **Accessing Protected Page:**
```
1. User visits /home → RouteProtector checks
2. RouteProtector: "Have token? Yes!" → Show HomePage
3. HomePage requests data → axios.get('/users/profile')
4. Token auto-attached → Authorization: Bearer <token>
5. Backend middleware checks → "Valid token!"
6. Backend sends data → Profile information
7. Page displays data → ✅
```

### **Browser Refresh:**
```
1. Page reloads → All memory cleared
2. AuthProvider checks → localStorage.getItem("token")
3. Token found! → Re-attach to axios
4. Still logged in → ✅ No need to re-enter password
```

### **Logout:**
```
1. Click logout → setToken(null)
2. AuthProvider clears → Delete from localStorage + axios
3. Try to access /home → RouteProtector redirects to login
4. Logged out → ✅
```

---

## 📁 File Structure

```
Backend:
server/routes/users.js       ← Login + Token verification + Protected routes

Frontend:
client/src/
├── Authentication/
│   └── authProvider.js      ← Stores token, auto-attaches to requests
├── components/
│   ├── loginForm.jsx        ← Login UI
│   └── RouteProtector.jsx   ← Protects pages
├── pages/
│   ├── login.jsx            ← Login page
│   └── homePage.jsx         ← Protected page
└── App.js                   ← Routes setup
```

---

## ❓ Common Questions

**Q: Where is the token stored?**  
A: In two places:
1. React state (in AuthProvider) - for using it
2. Browser localStorage - for keeping it after refresh

**Q: How does the backend know who I am?**  
A: The token contains your info (userId, email). Backend reads it after verifying.

**Q: Can someone fake a token?**  
A: No! It's signed with a secret key. If modified, signature becomes invalid.

**Q: What if my token expires?**  
A: You'll get an error and need to log in again.

**Q: Do I need to attach the token to every request?**  
A: Nope! AuthProvider does it automatically via `axios.defaults.headers`.

---

## 🔑 Key Points

| What | Where | Why |
|------|-------|-----|
| **Create Token** | Backend login route | Proves user logged in |
| **Verify Token** | Backend middleware | Checks token is valid |
| **Store Token** | Frontend AuthProvider | Keeps user logged in |
| **Check Token** | Frontend RouteProtector | Shows/hides pages |
| **Auto-attach** | Frontend AuthProvider | No manual work needed |

---

## 🎯 Quick Summary

**Backend:**
- Login route creates JWT token
- Middleware checks if token is valid
- Protected routes require valid token

**Frontend:**
- AuthProvider stores token and auto-attaches to requests
- RouteProtector blocks pages without token
- LoginForm gets token from backend

**Token Flow:**
1. Login → Get token
2. Save token → localStorage + axios
3. Make requests → Token auto-included
4. Backend verifies → Returns data
5. Logout → Clear token

---

**That's it! JWT is just a secure way to prove you're logged in without sending your password every time!** 🎉

*Last Updated: November 7, 2025*

