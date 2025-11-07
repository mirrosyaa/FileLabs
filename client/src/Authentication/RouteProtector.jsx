import { Navigate } from "react-router-dom";
import { useAuth } from "../Authentication/authProvider";

/**
 * RouteProtector Component
 *
 * Wrapper component that protects routes from unauthorized access.
 * Checks if user has a valid JWT token before rendering the page.
 * If no token exists, redirects user to login page.
 *
 * Usage:
 * <Route path="/home" element={<RouteProtector><HomePage /></RouteProtector>} />
 */
export const RouteProtector = ({ children }) => {
  const { token } = useAuth();

  // If no token, redirect to login page
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If token exists, render the protected page
  return children;
};

export default RouteProtector;
