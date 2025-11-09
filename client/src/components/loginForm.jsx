import { React, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/authProvider";
import axios from "axios";

function LoginForm() {
  // Store the user's input in state variables
  const navigate = useNavigate(); // used to help navigate between login and home page
  const { setToken } = useAuth(); // Get setToken from AuthProvider
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const errorMessage = (
    <h3 className="err">Incorrect username/email and password</h3>
  );

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the page from reloading
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
      setLoginError(true);
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
        <div>{loginError ? errorMessage : null}</div>

        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>
      </form>
    </div>
  );
}
export default LoginForm;
