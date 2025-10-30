import { React, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginForm() {
  // Store the user's input in state variables
  const navigate = useNavigate(); // used to help navigate between login and home page
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the page from reloading
    console.log("Email:", email);
    console.log("Password:", password);

    try {
      // send login data to backend
      const response = await axios.post("http://localhost:3001/users/login", {
        user_email: email,
        user_password: password,
      });
      console.log(response.data);
      navigate("/home"); // if login is successful, navigate to home page
    } catch (err) {
      // if login fails, log the error from the backend
      console.error("Login error:", err);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="text-center mb-4">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>
      </form>
    </div>
  );
}
export default LoginForm;
