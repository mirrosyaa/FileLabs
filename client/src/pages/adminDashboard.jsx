import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../CSS/adminDashboard.css";
import AdminHeader from "../components/AdminHeader";
import SearchBar from "../components/SearchBar";
import UsersTable from "../components/UsersTable";
import Navbar from "../components/navbar";
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
      <Navbar />
      <div className="dashboard-container">
        <AdminHeader />
        <div className="dashboard-controls">
          <div className="search-filter-group">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <div className="filter-controls">
              <button
                className={`filter-btn ${
                  userTypeFilter === "all" ? "active" : ""
                }`}
                onClick={() => setUserTypeFilter("all")}
              >
                All Users
              </button>
              <button
                className={`filter-btn ${
                  userTypeFilter === "admin" ? "active" : ""
                }`}
                onClick={() => setUserTypeFilter("admin")}
              >
                👤 Admins
              </button>
              <button
                className={`filter-btn ${
                  userTypeFilter === "user" ? "active" : ""
                }`}
                onClick={() => setUserTypeFilter("user")}
              >
                👥 Users
              </button>
            </div>
          </div>
          <button
            className="add-btn"
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
