import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "./Navbar";
import UserNavbar from "./UserNavbar";
import SellerNavbar from "./SellerNavbar";
import AdminNavbar from "./AdminNavbar";
import FloatingCart from "./FloatingCart";
import { useLocation } from "react-router-dom";

function NavbarContainer() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  // Don't show navbar on auth pages
  if (isAuthPage) return null;

  // Return appropriate navbar based on auth state and role
  if (!user) {
    return (
      <>
        <Navbar />
        <FloatingCart />
      </>
    );
  }

  // Check user role and return corresponding navbar
  switch (user.role) {
    case 'admin':
      return (
        <>
          <AdminNavbar />
          {/* No floating cart for admin */}
        </>
      );
    case 'seller':
      return (
        <>
          <SellerNavbar />
          {/* Floating cart only for users, not sellers */}
        </>
      );
    case 'user':
      return (
        <>
          <UserNavbar />
          <FloatingCart />
        </>
      );
    default:
      return (
        <>
          <UserNavbar />
          <FloatingCart />
        </>
      );
  }
}

export default NavbarContainer;
