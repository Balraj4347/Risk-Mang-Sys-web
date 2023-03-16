import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, isLogged }) => {
  return <>{!isLogged ? <Navigate to='/login' /> : children}</>;
};

export default ProtectedRoute;
