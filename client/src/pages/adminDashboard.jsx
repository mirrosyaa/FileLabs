import React, { useState, useRef } from "react";
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
  const usersTableRef = useRef();

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
