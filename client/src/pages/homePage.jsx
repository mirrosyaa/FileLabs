import { React, useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Boxes from "../components/boxes";
import Footer from "../components/footer";
import axios from "axios";
import "../CSS/homePage.css";

function HomePage() {
  const [username, setUsername] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // Fetch username
    const fetchUsername = async () => {
      try {
        const response = await axios.get("http://localhost:3001/users/profile");
        setUsername(response.data.user.username);
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    // Determine greeting based on time
    const determineGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting("Good Morning");
      } else if (hour < 18) {
        setGreeting("Good Afternoon");
      } else {
        setGreeting("Good Evening");
      }
    };

    fetchUsername();
    determineGreeting();
  }, []);

  return (
    <div className="page-container">
      <Navbar />
      <div className="greeting-header">
        <h1>
          {greeting}, {username || "User"}
        </h1>
      </div>
      <Boxes />
      <Footer />
    </div>
  );
}
export default HomePage;
