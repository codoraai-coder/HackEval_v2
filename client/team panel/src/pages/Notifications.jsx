import React, { useContext, useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { TeamContext } from "../context/TeamContext";
import { motion } from "framer-motion";
// const { token } = useContext(TeamContext);

import { API_BASE_URL } from "../config"; // Your FastAPI server URL

const Notifications = () => {
  const socket = useSocket();
  const { team } = useContext(TeamContext); // For authentication token
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setNotifications(data);
    }
    fetchNotifications();
  }, [token]);

  const markAsRead = (notificationId) => {
    // In a real app, you'd call a PUT API to mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
  };

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="notifications-container">
      <h1>Notifications</h1>

      {!socket && (
        <div
          style={{
            background: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
            color: "#856404",
          }}
        >
          <strong>Offline Mode:</strong> Real-time notifications are not
          available. You can still view your existing notifications.
        </div>
      )}

      <div className="notifications-list">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            className={`notification-card ${notification.read ? "read" : "unread"}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="notification-header">
              <h3>{notification.title}</h3>
              <span className="timestamp">
                {getTimeAgo(notification.timestamp)}
              </span>
            </div>
            <p className="message">{notification.message}</p>
            {!notification.read && (
              <div className="unread-indicator">
                <span>New</span>
              </div>
            )}
          </motion.div>
        ))}

        {notifications.length === 0 && (
          <div className="no-notifications">
            <p>No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;