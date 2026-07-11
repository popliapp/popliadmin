// src/routes/ProtectedRoute.js
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../api/auth";

const ProtectedRoute = ({ roles }) => {
  const { isAuth, role } = useAuth();

  // not logged in
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // no role restriction
  if (!roles || roles.length === 0) {
    return <Outlet />;
  }

  // role mismatch
  if (!roles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
