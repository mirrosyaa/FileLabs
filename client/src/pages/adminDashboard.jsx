import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import styles from "../CSS/Pages/adminDashboard.module.css";
import AdminHeader from "../components/Admin/AdminHeader";
import SearchBar from "../components/SearchBar";
import UsersTable from "../components/Admin/UsersTable";
import AddUserModal from "../modals/addUserModal";

function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const usersTableRef = useRef();

  // Fetch current admin's user ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get("http://localhost:3001/users/profile");
        setCurrentAdminId(response.data.user.userID);
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleUserAdded = () => {
    // Refresh the users table when a new user is added
    if (usersTableRef.current) {
      usersTableRef.current.refreshUsers();
    }
  };

  return (
    <div>
      <div className={styles["dashboard-container"]}>
        <AdminHeader />
        <div className={styles["dashboard-controls"]}>
          <div className={styles["search-filter-group"]}>
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <div className={styles["filter-controls"]}>
              <button
                className={`${styles["filter-btn"]} ${
                  userTypeFilter === "all" ? styles.active : ""
                }`}
                onClick={() => setUserTypeFilter("all")}
              >
                All Users
              </button>
              <button
                className={`${styles["filter-btn"]} ${
                  userTypeFilter === "admin" ? styles.active : ""
                }`}
                onClick={() => setUserTypeFilter("admin")}
              >
                👤 Admins
              </button>
              <button
                className={`${styles["filter-btn"]} ${
                  userTypeFilter === "user" ? styles.active : ""
                }`}
                onClick={() => setUserTypeFilter("user")}
              >
                👥 Users
              </button>
            </div>
          </div>
          <button
            className={styles["add-btn"]}
            onClick={() => setIsAddUserModalOpen(true)}
          >
            ➕ Add User
          </button>
        </div>
        <UsersTable
          ref={usersTableRef}
          searchTerm={searchTerm}
          userTypeFilter={userTypeFilter}
          currentAdminId={currentAdminId}
        />
      </div>
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserAdded={handleUserAdded}
      />
    </div>
  );
}

export default AdminDashboard;
