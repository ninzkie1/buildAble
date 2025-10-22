import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "./Navbar";
import UserNavbar from "./UserNavbar";
import SellerNavbar from "./SellerNavbar";
import { useLocation } from "react-router-dom";

function NavbarContainer() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  // Don't show navbar on auth pages
  if (isAuthPage) return null;

  // Return appropriate navbar based on auth state and role
  if (!user) return <Navbar />;

  // Check user role and return corresponding navbar
  switch (user.role) {
    case 'seller':
      return <SellerNavbar />;
    case 'user':
      return <UserNavbar />;
    default:
      return <UserNavbar />;
  }
}

export default NavbarContainer;
