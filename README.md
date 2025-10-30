# FileLabs

A web application that allows users to log in securely. Built with a React frontend (what you see) and an Express backend (the server that handles logins and data).

## 🏗️ Project Structure

```
FileLabs/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable components (LoginForm)
│       ├── pages/          # Page components (Login, Home)
│       ├── CSS/            # Stylesheets
│       ├── App.js          # Main app with routing
│       └── index.js        # Entry point
├── server/                 # Express backend
│   ├── database/
│   │   └── db.js          # MySQL connection
│   ├── routes/
│   │   └── users.js       # User routes
│   └── index.js           # Server entry point
└── package.json           # Root scripts (concurrent dev)
```

## 🛠️ Tech Stack

### Frontend (`/client`)

- **React** `19.2.0` - UI framework
- **React Router DOM** `7.9.4` - Client-side routing
- **Axios** `1.12.2` - HTTP requests to backend
- **Bootstrap** `5.3.8` - UI styling
- **React Scripts** `5.0.1` - Build tooling

### Backend (`/server`)

- **Express** `5.1.0` - Web server framework
- **MySQL2** `3.15.3` - MySQL database driver
- **CORS** `2.8.5` - Cross-origin resource sharing
- **Nodemon** `3.1.10` (dev) - Auto-restart server

### Development

- **Concurrently** `9.2.1` - Run client & server simultaneously

## 🚀 Running the Application

```bash
npm start
```

This will open:

- The website at `http://localhost:3000` (open this in your browser)
- The server at `http://localhost:3001` (runs in the background)

**Or run them separately** (if you need to):

```bash
npm run client  # Just the website
npm run server  # Just the server
```

💡 **Tip:** Once you run `npm start`, wait about 10-20 seconds and your browser should automatically open the login page!

## 📡 How the Login Works

When you enter your email and password and click "Login":

1. The website sends your info to the server
2. The server checks the database to see if you're a registered user
3. If correct, you're taken to the home page
4. If wrong, you'll see an error message

## 🔐 Security Note

**⚠️ This is for learning/testing only!** Don't use this for real user data yet.

To make it production-ready, you'd need to:

- Hide passwords in the code (use environment variables)
- Encrypt passwords (so they're not stored as plain text)
- Add secure login sessions
- Use HTTPS (the secure version of HTTP)

## 📝 Features

- ✅ User login authentication
- ✅ React Router navigation
- ✅ MySQL database integration
- ✅ RESTful API architecture
- ✅ Bootstrap-styled UI

## 🧪 Other Useful Commands

```bash
npm run client     # Run just the website
npm run server     # Run just the server
```

**For developers:**

- `npm run dev` (in `/server`) - Auto-restarts the server when you make changes
- `npm test` (in `/client`) - Run tests
- `npm run build` (in `/client`) - Create a production version

## 📄 License

ISC
