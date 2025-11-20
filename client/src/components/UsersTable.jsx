import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import styles from "../CSS/adminDashboard.module.css";
import axios from "axios";
import UserDetailsModal from "../modals/userDetailsModal";

const UsersTable = forwardRef(
  ({ searchTerm = "", userTypeFilter = "all", currentAdminId = null }, ref) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleRowClick = (userId) => {
      setSelectedUserId(userId);
      setIsModalOpen(true);
    };

    const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedUserId(null);
    };

    const handleUserDeleted = () => {
      // Refresh the users list after deletion
      fetchUsers();
      handleCloseModal();
    };

    if (loading) {
      return (
        <div className={styles["table-container"]}>
          <div className={styles["loading-message"]}>Loading users...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles["table-container"]}>
          <div className={styles["error-message"]}>{error}</div>
        </div>
      );
    }

    return (
      <div className={styles["table-container"]}>
        <table className={styles["user-table"]}>
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
                <tr
                  key={user.id}
                  onClick={() => handleRowClick(user.id)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.joined}</td>
                  <td>
                    <span
                      className={`${styles["user-type-badge"]} ${
                        styles[user.userType]
                      }`}
                    >
                      {user.userType === "admin" ? "👤 Admin" : "👥 User"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={styles["no-users"]}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <UserDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          userId={selectedUserId}
          onUserDeleted={handleUserDeleted}
          currentAdminId={currentAdminId}
        />
      </div>
    );
  }
);

export default UsersTable;
