import React from "react";
import "../CSS/adminDashboard.css";

function UsersTable({ users, onDelete }) {
  return (
    <div className="table-container">
      <table className="user-table">
        <thead>
          <tr>
            <th>User’s Name</th>
            <th>Email Address</th>
            <th>Date of Join</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.joined}</td>
                <td>
                  <button className="delete-btn" onClick={() => onDelete(user.id)}>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="no-users">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UsersTable;
