import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/authProvider";
import axios from "axios";
import "../CSS/login.css"; // added: starfield + login-box styles
// ...existing code...

function LoginForm() {
  // Store the user's input in state variables
  const navigate = useNavigate(); // used to help navigate between login and home page
  const { setToken } = useAuth(); // Get setToken from AuthProvider
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // --- added: generate randomized stars for the animated background ---
  const STAR_COUNT = 140;
  const rand = (min, max) => Math.random() * (max - min) + min;
  const stars = Array.from({ length: STAR_COUNT }).map((_, i) => {
    const left = `${rand(0, 100)}%`;
    const top = `${rand(0, 100)}%`;
    const size = `${Math.floor(rand(1, 4))}px`;
    const duration = `${rand(6, 20)}s`;
    const delay = `${-rand(0, 20)}s`;
    return (
      <div
        key={i}
        className="star"
        style={{
          left,
          top,
          width: size,
          height: size,
          animationDuration: duration,
          animationDelay: delay,
        }}
      />
    );
  });
  // --- end star generation ---

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the page from reloading
    setErrorMessage(""); // Clear previous errors
    console.log("Email/Username:", emailOrUsername);
    console.log("Password:", password);

    try {
      // send login data to backend
      const response = await axios.post("http://localhost:3001/users/login", {
        user_email: emailOrUsername, // Backend accepts either email or username
        user_password: password,
      });
      console.log(response.data);

      // Save JWT token to AuthProvider
      setToken(response.data.token);

      navigate("/home"); // if login is successful, navigate to home page
    } catch (err) {
      // if login fails, log the error from the backend
      console.error("Login error:", err);

      // Check if it's a server error (500) or authentication error (401)
      if (err.response) {
        if (err.response.status === 500) {
          setErrorMessage("Server error. Please try again later.");
        } else if (err.response.status === 401) {
          setErrorMessage("Incorrect username/email or password");
        } else {
          setErrorMessage(err.response.data.message || "Login failed");
        }
      } else if (err.request) {
        // Network error - no response received
        setErrorMessage(
          "Unable to connect to server. Please check your connection."
        );
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="login-page-container">
      <div className="starfield">{stars}</div>

      <div className="login-box">
        <div className="container" style={{ maxWidth: "400px" }}>
          <h2 className="text-center mb-4">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="emailOrUsername" className="form-label">
                Email or Username
              </label>
              <input
                type="text"
                className="form-control"
                id="emailOrUsername"
                placeholder="Enter your email or username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {errorMessage && (
              <div className="alert alert-danger">{errorMessage}</div>
            )}

            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default LoginForm;