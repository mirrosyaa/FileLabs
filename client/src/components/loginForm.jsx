<<<<<<< Updated upstream
// ...existing code...
=======
>>>>>>> Stashed changes
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/authProvider";
import axios from "axios";
import "../CSS/login.css"; // added: starfield + login-box styles
// ...existing code...

function LoginForm() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

<<<<<<< Updated upstream
=======
  // --- added: generate randomized stars for the animated background ---
  const STAR_COUNT = 240;
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
>>>>>>> Stashed changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    console.log("Email/Username:", emailOrUsername);
    // password console.log intentionally removed for security

    try {
      const response = await axios.post("http://localhost:3001/users/login", {
        user_email: emailOrUsername,
        user_password: password,
      });
      setToken(response.data.token);
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err);
      if (err.response) {
        if (err.response.status === 500) {
          setErrorMessage("Server error. Please try again later.");
        } else if (err.response.status === 401) {
          setErrorMessage("Incorrect username/email or password");
        } else {
          setErrorMessage(err.response.data.message || "Login failed");
        }
      } else if (err.request) {
        setErrorMessage("Unable to connect to server. Please check your connection.");
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="login-page-container">
      <div className="starfield">{stars}</div>

<<<<<<< Updated upstream
        {/* simple password field (restored) */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="form-control"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
=======
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
>>>>>>> Stashed changes

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