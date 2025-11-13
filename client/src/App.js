import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthProvider from "./Authentication/authProvider";
import RouteProtector from "./Authentication/RouteProtector";
import AdminRouteProtector from "./Authentication/AdminRouteProtector";
import LoginPage from "./pages/login";
import HomePage from "./pages/homePage";
import AdminDashboard from "./pages/adminDashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div id="App Content">
          <Routes>
            {/* Public routes*/}
            <Route path="/" element={<LoginPage />} />

            {/* Protected routes*/}
            <Route
              path="/home"
              element={
                <RouteProtector>
                  <HomePage />
                </RouteProtector>
              }
            />
            {/* Admin Protected routes */}
            <Route
              path="/admin"
              element={
                <AdminRouteProtector>
                  <AdminDashboard />
                </AdminRouteProtector>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
