import React, { useState } from "react";
import "../CSS/adminDashboard.css";
import AdminHeader from "../components/AdminHeader";
import SearchBar from "../components/SearchBar";
import UsersTable from "../components/UsersTable";
import Navbar from "../components/navbar";

function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      joined: "2024-09-12",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      joined: "2024-10-02",
    },
  ]);

  // Add new user
  const handleAddUser = () => {
    const newUser = {
      id: Date.now(),
      name: "New User",
      email: "newuser@example.com",
      joined: new Date().toISOString().split("T")[0],
    };
    setUsers([...users, newUser]);
  };

  // Delete user by ID
  const handleDelete = (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  // Filter by search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <AdminHeader />
        <div className="dashboard-controls">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
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
