import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (isAuthenticated && user) {
    // If user needs to select a role, redirect to role selection page
    if (user.needsRoleSelection) {
      return <Navigate to="/select-role" replace />;
    }

    // Redirect authenticated users to their appropriate home page
    const getTargetPath = (role) => {
      switch (role) {
        case "seller":
          return "/sellerHome";
        case "admin":
          return "/adminPanel";
        case "user":
          return "/userHome";
        default:
          return "/userHome";
      }
    };

    return <Navigate to={getTargetPath(user.role)} replace />;
  }

  return children;
}

