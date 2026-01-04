import { React, useState, useEffect } from "react";
import Footer from "../components/footer";
import WelcomeBanner from "../components/WelcomeBanner";
import StatsContainer from "../components/StatsContainer";
import QuickActions from "../components/QuickActions";
import RecentActivity from "../components/RecentActivity";
import axios from "axios";
import styles from "../CSS/homePage.module.css";

function HomePage() {
  const [username, setUsername] = useState("Guest");
  const [greeting, setGreeting] = useState("");
  const [stats, setStats] = useState({
    myFiles: 0,
    sharedFiles: 0,
    starredFiles: 0,
    storageUsed: 0,
  });

  // Function to fetch username
  const fetchUsername = async () => {
    try {
      const response = await axios.get("http://localhost:3001/users/profile", {
        timeout: 5000
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

    // Mock stats - replace with actual API
    setStats({
      myFiles: 156,
      sharedFiles: 23,
      starredFiles: 8,
      storageUsed: 4.2,
    });
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
      <WelcomeBanner greeting={greeting} username={username} />
      <StatsContainer stats={stats} />
      <QuickActions />
      <RecentActivity />
      <Footer />
    </div>
  );
}
export default HomePage;
