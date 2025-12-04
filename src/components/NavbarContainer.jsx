import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "./Navbar";
import UserNavbar from "./UserNavbar";
import SellerNavbar from "./SellerNavbar";
import AdminNavbar from "./AdminNavbar";
import RiderNavbar from "./RiderNavbar";
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
    case 'rider':
      return (
        <>
          <RiderNavbar />
          {/* No floating cart for riders */}
        </>
      );
    case 'user':
      return (
        <>
          <UserNavbar />
        </>
      );
    default:
      return (
        <>
          <UserNavbar />
        </>
      );
  }
}

export default NavbarContainer;
