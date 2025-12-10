import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { TeamContext } from '../context/TeamContext';

const PrivateRoute = ({ children }) => {
  const { team } = useContext(TeamContext);

  if (!team) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default PrivateRoute;