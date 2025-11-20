import { React, useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Boxes from "../components/boxes";
import Footer from "../components/footer";
import axios from "axios";
import styles from "../CSS/homePage.module.css";

function HomePage() {
  const [username, setUsername] = useState("");
  const [greeting, setGreeting] = useState("");

  // Function to fetch username
  const fetchUsername = async () => {
    try {
      const response = await axios.get("http://localhost:3001/users/profile");
      setUsername(response.data.user.username);
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  };

  useEffect(() => {
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

  // Listen for username updates from settings modal
  useEffect(() => {
    const handleUsernameUpdate = () => {
      console.log("Username updated, reloading...");
      fetchUsername();
    };

    window.addEventListener("usernameUpdated", handleUsernameUpdate);

    return () => {
      window.removeEventListener("usernameUpdated", handleUsernameUpdate);
    };
  }, []);

  return (
    <div className={styles["home-page-wrapper"]}>
      <Navbar />
      <div className={styles["greeting-header"]}>
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
