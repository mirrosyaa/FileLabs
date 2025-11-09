import React, { useState } from "react";
import "../CSS/adminDashboard.css";
import AdminHeader from "../components/AdminHeader";
import SearchBar from "../components/SearchBar";
import UsersTable from "../components/UsersTable";
import Navbar from "../components/navbar";

function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      joined: "2024-09-12",
      userType: "user",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      joined: "2024-10-02",
      userType: "admin",
    },
  ]);

  // Add new user
  const handleAddUser = () => {
    const newUser = {
      id: Date.now(),
      name: "New User",
      email: "newuser@example.com",
      joined: new Date().toISOString().split("T")[0],
      userType: "user",
    };
    setUsers([...users, newUser]);
  };

  // Delete user by ID
  const handleDelete = (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  // Filter by search term and user type
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      userTypeFilter === "all" || user.userType === userTypeFilter;

    return matchesSearch && matchesType;
  });

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
          <button className="add-btn" onClick={handleAddUser}>
            ➕ Add User
          </button>
        </div>
        <UsersTable users={filteredUsers} onDelete={handleDelete} />
      </div>
    </div>
  );
}

export default AdminDashboard;
