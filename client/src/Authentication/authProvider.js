import axios from "axios";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext();

// Function to decode JWT and get expiration time
const getTokenExpiration = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const decoded = JSON.parse(jsonPayload);
    return decoded.exp ? decoded.exp * 1000 : null; // Convert to milliseconds
  } catch (e) {
    console.error("Error decoding token:", e);
    return null;
  }
};

const AuthProvider = ({ children }) => {
  // State to hold the authentication token
  const [token, setToken_] = useState(localStorage.getItem("token"));
  const [showSessionExpired, setShowSessionExpired] = useState(false);

  // Function to set the authentication token
  const setToken = (newToken) => {
    setToken_(newToken);
  };

  // Function to handle session expiration
  const handleSessionExpired = () => {
    setShowSessionExpired(true);
    setToken(null);
  };

  useEffect(() => {
    // Setup axios interceptor to catch 401 errors
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Token is invalid or expired
          handleSessionExpired();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      // Cleanup interceptor on unmount
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
      localStorage.setItem("token", token);

      // Set up token expiration check
      const expirationTime = getTokenExpiration(token);
      if (expirationTime) {
        const now = Date.now();
        const timeUntilExpiration = expirationTime - now;

        if (timeUntilExpiration <= 0) {
          // Token already expired
          handleSessionExpired();
        } else {
          // Set timeout to show modal when token expires
          const expirationTimeout = setTimeout(() => {
            handleSessionExpired();
          }, timeUntilExpiration);

          // Also check every minute if token has expired (in case user changes system time)
          const checkInterval = setInterval(() => {
            const currentTime = Date.now();
            if (currentTime >= expirationTime) {
              handleSessionExpired();
              clearInterval(checkInterval);
            }
          }, 60000); // Check every minute

          return () => {
            clearTimeout(expirationTimeout);
            clearInterval(checkInterval);
          };
        }
      }
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  }, [token]);

  // Memoised value of the authentication context
  const contextValue = useMemo(
    () => ({
      token,
      setToken,
      showSessionExpired,
      setShowSessionExpired,
    }),
    [token, showSessionExpired]
  );

  // Provide the authentication context to the children components
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;
