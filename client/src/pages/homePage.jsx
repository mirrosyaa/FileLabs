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
      <Boxes />
      <Footer />
    </div>
  );
}
export default HomePage;
