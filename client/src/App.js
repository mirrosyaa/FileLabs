import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import AuthProvider from "./Authentication/authProvider";
import RouteProtector from "./Authentication/RouteProtector";
import AdminRouteProtector from "./Authentication/AdminRouteProtector";
import LoginPage from "./pages/login";
import HomePage from "./pages/homePage";
import AdminDashboard from "./pages/adminDashboard";
import FileConverter from "./pages/fileConverter";
import LoadingScreen from "./pages/loadingScreen";
import Navbar from "./components/navbar";
import { useAuth } from "./Authentication/authProvider";

function AppContent() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const previousLocation = React.useRef(location.pathname);
  const { token } = useAuth();

  // Check if user is logged in (not on login page)
  const isLoggedIn = token && location.pathname !== "/";

  useEffect(() => {
    const fromLogin = previousLocation.current === "/";
    const toHome = location.pathname === "/home";

    // Only show loading screen when going from login to home
    if (fromLogin && toHome) {
      setLoading(true);

      // Hide loading screen after 2 seconds
      const hideTimer = setTimeout(() => {
        setLoading(false);
      }, 2000);

      // Update previous location
      previousLocation.current = location.pathname;

      return () => {
        clearTimeout(hideTimer);
      };
    }

    // Update previous location for other transitions
    previousLocation.current = location.pathname;
  }, [location.pathname]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div id="App">
      {/* Persistent Navbar - only shown when logged in */}
      {isLoggedIn ? (
        <div id="Navbar">
          <Navbar />
        </div>
      ) : null}

      {/* Page Content */}
      <div id="App-Content">
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
          <Route
            path="/file-converter"
            element={
              <RouteProtector>
                <FileConverter />
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
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
