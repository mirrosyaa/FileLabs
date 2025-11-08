import { React } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Authentication/authProvider";
import Navbar from "../components/navbar";
import Boxes from "../components/boxes";
import Footer from "../components/footer";


function HomePage() {
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(null); // Clear the token
    navigate("/"); // Redirect to login page
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="container mt-5">
        <h1>Welcome to the Home Page</h1>
        <p>You are successfully logged in!</p>
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <Boxes />
      <Footer />
    </div>
  );
}
export default HomePage;
