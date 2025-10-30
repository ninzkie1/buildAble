import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Settings,
  Users,
  LogOut,
  Menu as MenuIcon,
  X as XIcon,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import logo from "/logo.png";

function SellerNavbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (
        openRef.current &&
        menuRef.current &&
        btnRef.current &&
        !menuRef.current.contains(e.target) &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const handleKey = (e) => e.key === "Escape" && setOpen(false);

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const LinkItem = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className="flex items-center gap-2 text-white hover:text-orange-200 transition px-3 py-1 md:py-2 rounded-md hover:bg-[#B84937]/50 md:hover:bg-transparent text-sm md:text-base"
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-[#B84937] to-[#7A2B22] text-white shadow-md backdrop-blur-sm transition-all duration-300"
    >
      <div className="w-full px-4 md:px-8 py-2 md:py-3 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/seller" className="flex items-center gap-2">
          <img
            src={logo}
            alt="buildAble"
            className="w-12 md:w-20 h-12 md:h-20 object-contain"
          />
          <span className="font-bold text-lg md:text-xl">buildAble Seller</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <LinkItem to="/sellerHome" icon={LayoutDashboard} label="Dashboard" />
          <LinkItem to="/seller/products" icon={Package} label="Products" />
          <LinkItem to="/seller/orders" icon={ClipboardList} label="Orders" />
          <LinkItem to="/seller/customers" icon={Users} label="Customers" />
          <LinkItem to="/seller/profile" icon={Settings} label="Profile" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white hover:text-orange-200 px-3 py-1 md:py-2 rounded-md hover:bg-[#B84937]/50"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          ref={btnRef}
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-md hover:bg-[#B84937]/50 transition"
        >
          {open ? <XIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div
        ref={menuRef}
        className={`absolute top-16 md:top-20 left-0 right-0 shadow-lg z-50 transform transition-all duration-500 ease-in-out ${
          open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        } bg-gradient-to-r from-[#B84937] to-[#7A2B22]`}
      >
        <div className="flex flex-col items-center py-2 md:py-3 space-y-1 md:space-y-2">
          <LinkItem to="/sellerHome" icon={LayoutDashboard} label="Dashboard" />
          <LinkItem to="/seller/products" icon={Package} label="Products" />
          <LinkItem to="/seller/orders" icon={ClipboardList} label="Orders" />
          <LinkItem to="/seller/customers" icon={Users} label="Customers" />
          <LinkItem to="/seller/settings" icon={Settings} label="Settings" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white hover:text-orange-200 w-full px-3 py-2 rounded-md hover:bg-[#B84937]/50"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default SellerNavbar;
