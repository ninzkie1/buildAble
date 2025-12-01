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
  Bell,
} from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
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
      className="flex items-center gap-2.5 md:gap-2 text-white/90 md:text-white hover:text-white md:hover:text-orange-200 transition-all duration-200 md:transition px-4 md:px-3 py-2.5 md:py-2 rounded-lg md:rounded-md hover:bg-white/10 md:hover:bg-[#B84937]/50 md:hover:bg-transparent font-medium md:font-normal text-sm md:text-base tracking-wide md:tracking-normal"
    >
      <Icon size={18} className="stroke-[1.5] md:stroke-2" />
      <span>{label}</span>
    </Link>
  );

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-[#B84937] via-[#B84937] to-[#7A2B22] text-white shadow-xl backdrop-blur-md transition-all duration-300 border-b border-white/10"
    >
      <div className="w-full md:max-w-none max-w-7xl mx-auto px-4 md:px-8 py-2 md:py-3 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/seller" className="flex items-center gap-3 md:gap-2 group transition-transform duration-200 hover:scale-105 md:hover:scale-100 md:transition-none">
          <img
            src={logo}
            alt="buildAble"
            className="w-12 h-12 md:w-20 md:h-20 object-contain drop-shadow-lg"
          />
          <div className="flex flex-col">
            <span className="font-bold text-lg md:text-lg tracking-tight md:tracking-normal group-hover:text-white/95 md:group-hover:text-white transition-colors md:transition-none">
              buildAble Seller
            </span>
            <span className="text-xs text-white/70 font-medium tracking-wide md:hidden">Seller Portal</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <LinkItem to="/sellerHome" icon={LayoutDashboard} label="Dashboard" />
          <LinkItem to="/seller/products" icon={Package} label="Products" />
          <LinkItem to="/seller/orders" icon={ClipboardList} label="Orders" />
          <LinkItem to="/seller/customers" icon={Users} label="Customers" />
          <LinkItem to="/seller/profile" icon={Settings} label="Profile" />
          
          {/* Notification Dropdown */}
          <div className="hidden md:flex items-center">
            <NotificationDropdown />
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white hover:text-orange-200 transition-all duration-200 px-3 py-2 rounded-md hover:bg-[#B84937]/50 font-medium"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          ref={btnRef}
          onClick={() => setOpen(!open)}
          className="md:hidden p-2.5 rounded-lg hover:bg-white/10 transition-all duration-200 active:scale-95"
        >
          {open ? <XIcon size={24} className="stroke-[1.5]" /> : <MenuIcon size={24} className="stroke-[1.5]" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div
        ref={menuRef}
        className={`absolute top-16 md:top-20 left-0 right-0 shadow-2xl z-50 transform transition-all duration-300 ease-out ${
          open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        } bg-gradient-to-b from-[#B84937] via-[#B84937] to-[#7A2B22] border-t border-white/10`}
      >
        <div className="flex flex-col items-stretch px-4 py-4 space-y-1">
          <LinkItem to="/sellerHome" icon={LayoutDashboard} label="Dashboard" />
          <LinkItem to="/seller/products" icon={Package} label="Products" />
          <LinkItem to="/seller/orders" icon={ClipboardList} label="Orders" />
          <LinkItem to="/seller/customers" icon={Users} label="Customers" />
          <div className="h-px bg-white/10 my-2"></div>
          <LinkItem to="/seller/profile" icon={Settings} label="Settings" />
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2.5 text-white/90 hover:text-white transition-all duration-200 px-4 py-3 rounded-lg hover:bg-white/10 font-medium text-sm tracking-wide border border-white/20 hover:border-white/30 mt-2"
          >
            <LogOut size={18} className="stroke-[1.5]" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default SellerNavbar;
