import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { TeamContext } from "../context/TeamContext.jsx";

const PrivateRoute = ({ children }) => {
  const { team, loading } = useContext(TeamContext);

  // IMPORTANT: wait for loading to finish
  if (loading) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  if (!team) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default PrivateRoute;
