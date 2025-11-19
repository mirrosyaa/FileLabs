// ...existing code...
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/authProvider";
import axios from "axios";

function LoginForm() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginForm;