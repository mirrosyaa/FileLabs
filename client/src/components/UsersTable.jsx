import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import "../CSS/adminDashboard.css";
import axios from "axios";

const UsersTable = forwardRef(
  ({ searchTerm = "", userTypeFilter = "all" }, ref) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all users when component mounts
    useEffect(() => {
      fetchUsers();
    }, []);

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:3001/users/admin/users"
        );
        console.log("Fetched users:", response.data);

        // Transform the data to match the format expected by UsersTable
        const transformedUsers = response.data.users.map((user) => ({
          id: user.userID,
          name: user.username,
          email: user.user_email,
          joined: new Date(user.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          userType: user.user_type,
        }));

        setUsers(transformedUsers);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again.");
        setLoading(false);
      }
    };

    // Expose refreshUsers method to parent via ref
    useImperativeHandle(ref, () => ({
      refreshUsers: fetchUsers,
    }));

    const filteredUsers = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        userTypeFilter === "all" ||
        (userTypeFilter === "admin" && user.userType === "admin") ||
        (userTypeFilter === "user" && user.userType === "user");

      return matchesSearch && matchesFilter;
    });

    if (loading) {
      return (
        <div className="table-container">
          <div className="loading-message">Loading users...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="table-container">
          <div className="error-message">{error}</div>
        </div>
      );
    }

    return (
      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email Address</th>
              <th>Date Joined</th>
              <th>User Type</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.joined}</td>
                  <td>
                    <span className={`user-type-badge ${user.userType}`}>
                      {user.userType === "admin" ? "👤 Admin" : "👥 User"}
                    </span>
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
);

export default UsersTable;
