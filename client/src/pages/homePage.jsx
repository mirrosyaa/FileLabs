import { React, useState, useEffect } from "react";
import Footer from "../components/Layout/footer";
import WelcomeSection from "../components/HomePage/WelcomeSection";
import FileTypeCards from "../components/HomePage/FileTypeCards";
import CommonActions from "../components/HomePage/CommonActions";
import axios from "axios";
import styles from "../CSS/Pages/homePage.module.css";

function HomePage() {
  const [username, setUsername] = useState("Guest");
  const [greeting, setGreeting] = useState("");

  // Function to fetch username
  const fetchUsername = async () => {
    try {
      const response = await axios.get("http://localhost:3001/users/profile", {
        timeout: 5000,
      });
      setUsername(response.data.user.username);
    } catch (error) {
      // Silently fail for auth errors - keep default "Guest"
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        console.error("Error fetching username:", error);
      }
      setUsername("Guest");
    }
  };

  // Mock data for dashboard - replace with actual API calls later
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
      <WelcomeSection greeting={greeting} username={username} />
      <FileTypeCards />
      <Footer />
    </div>
  );
}
export default HomePage;
