import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/login";
import HomePage from "./pages/homePage";

function App() {
  return (
    <Router>
      <div id="App Content">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
