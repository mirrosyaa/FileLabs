import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/authProvider";
import axios from "axios";
import styles from "../CSS/login.module.css";

function LoginForm() {
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword((v) => !v);
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("rememberMe")) || false;
    } catch {
      return false;
    }
  });
  const toggleRemember = () => {
    setRememberMe((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("rememberMe", JSON.stringify(next));
      } catch {}
      return next;
    });
  };
  // helpers for randomized animated layers
  const rand = (min, max) => Math.random() * (max - min) + min;

  // starfield (unchanged)
  const STAR_COUNT = 300;
  const stars = useMemo(() => {
    return Array.from({ length: STAR_COUNT }).map((_, i) => {
      const left = `${rand(0, 100)}%`;
      const top = `${rand(0, 100)}%`;
      const size = `${Math.floor(rand(1, 4))}px`;
      const duration = `${rand(6, 20)}s`;
      const delay = `${-rand(0, 20)}s`;
      return (
        <div
          key={`star-${i}`}
          className={styles.star}
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
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const response = await axios.post("http://localhost:3001/users/login", {
        user_email: emailOrUsername,
        user_password: password,
      });
      setToken(response.data.token);

      // Trigger fade out on parent login page
      const loginContainer = document.querySelector(
        `.${styles["login-page-container"]}`
      );
      if (loginContainer) {
        loginContainer.classList.add(styles["fade-out"]);
      }

      // Navigate after fade out animation
      setTimeout(() => {
        navigate("/home");
      }, 300);
    } catch (err) {
      console.error("Login error:", err);
      if (err.response) {
        if (err.response.status === 500) {
          setErrorMessage("Server error. Please try again later.");
        } else if (err.response.status === 401) {
          setErrorMessage("Incorrect username/email or password");
        } else {
          setErrorMessage(err.response.data?.message || "Login failed");
        }
      } else if (err.request) {
        setErrorMessage(
          "Unable to connect to server. Please check your connection."
        );
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className={styles["login-page-container"]}>
      <div className={styles.starfield}>{stars}</div>

      <div className={styles["login-box"]}>
        <div className="container" style={{ maxWidth: "420px" }}>
          <h2 className="text-center mb-4">FileLabs</h2>

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
              <div className={styles["password-wrap"]}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles["password-toggle"]}
                  onClick={toggleShowPassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    focusable="false"
                    className={styles["eye-icon"]}
                  >
                    {/* Eye shape - always visible */}
                    <path
                      d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />

                    {/* Animated slash line */}
                    <line
                      x1="3"
                      y1="3"
                      x2="21"
                      y2="21"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      className={`${styles["eye-slash"]} ${
                        showPassword
                          ? styles["slash-hide"]
                          : styles["slash-show"]
                      }`}
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className={`mb-3 ${styles["remember-row"]}`}>
              <label className="form-check" htmlFor="rememberMe">
                <input
                  id="rememberMe"
                  type="checkbox"
                  className="form-check-input"
                  checked={rememberMe}
                  onChange={toggleRemember}
                />
                <span className="form-check-label">Remember me</span>
              </label>
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
