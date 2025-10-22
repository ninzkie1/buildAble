import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Home,
  Store,
  User,
  LogOut,
  Menu as MenuIcon,
  X as XIcon,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import logo from "/logo.png";

function AuthenticatedNavbar() {
  const [open, setOpen] = useState(false);
  const openRef = useRef(open);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Keep ref synced with state
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Handle outside click + ESC
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

  // Reusable link component
  const LinkItem = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className="flex items-center gap-2 text-white hover:text-orange-200 transition px-3 py-2 rounded-md hover:bg-orange-700/50 md:hover:bg-transparent"
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );

  return (
    <nav className="bg-gradient-to-r from-orange-600 to-red-600 text-white sticky top-0 left-0 w-full z-50 shadow-md backdrop-blur-sm transition-all duration-300">
      <div className="w-full h-20 px-4 md:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="buildAble" className="w-20 h-20 object-contain" />
          <span className="font-bold text-lg">buildAble</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <LinkItem to="/" icon={Home} label="Home" />
          <LinkItem to="/shop" icon={Store} label="Shop" />
          <LinkItem to="/cart" icon={ShoppingCart} label="Cart" />
          <LinkItem to="/profile" icon={User} label={user?.name} />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white hover:text-orange-200 transition px-3 py-2 rounded-md hover:bg-orange-700/50"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Burger */}
        <button
          ref={btnRef}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className="md:hidden p-2 rounded-md hover:bg-orange-700/50 transition"
        >
          {open ? <XIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div
        ref={menuRef}
        className={`absolute top-16 left-0 right-0 bg-gradient-to-r from-orange-600 to-red-600 shadow-lg z-50 transform transition-all duration-500 ease-in-out ${
          open
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center py-3 space-y-2">
          <LinkItem to="/" icon={Home} label="Home" />
          <LinkItem to="/shop" icon={Store} label="Shop" />
          <LinkItem to="/cart" icon={ShoppingCart} label="Cart" />
          <LinkItem to="/profile" icon={User} label={user?.name} />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white hover:text-orange-200 w-full px-3 py-2 rounded-md hover:bg-orange-700/50"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default AuthenticatedNavbar;
