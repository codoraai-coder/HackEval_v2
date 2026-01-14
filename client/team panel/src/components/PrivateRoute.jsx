import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { TeamContext } from "../context/TeamContext.jsx";

const PrivateRoute = ({ children }) => {
  const { team } = useContext(TeamContext);
  const { loading } = useContext(TeamContext);

  if (!team) {
    return <Navigate to="/signin" replace />;
  }
  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  return children;
};

export default PrivateRoute;
