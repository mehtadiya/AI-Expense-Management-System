import { Navigate } from "react-router-dom";
import { isTokenValid } from "../utils/auth";
import { getToken } from "../api/authService";

const PublicRoute = ({ children }) => {
  const token=getToken();
  if (token) {
    return <Navigate to="/main/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
