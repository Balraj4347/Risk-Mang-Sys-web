import React from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { useContext } from "react";
const ProtectedRoute = ({ children, isAdmin }) => {
  const authContext = useContext(AuthContext);

  return (
    <>{authContext.isLoggedIn === false ? <Navigate to='/' /> : children}</>
  );
};

export default ProtectedRoute;
