import React from "react";
import LoginForm from "../components/loginForm";
import "../CSS/login.css";

function LoginPage() {
  // page to display all login components
  return (
    <div className="login-page-container">
      <LoginForm />
    </div>
  );
}
export default LoginPage;
