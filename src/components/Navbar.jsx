import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Home,
  Store,
  LogIn,
  Menu as MenuIcon,
  X as XIcon,
} from "lucide-react";
import logo from "/logo.png";

function Navbar() {
  const [open, setOpen] = useState(false);
  const openRef = useRef(open);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

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

  // Reusable link component
  const LinkItem = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className="flex items-center gap-2 text-white hover:text-blue-200 transition px-3 py-2 rounded-md hover:bg-blue-700 md:hover:bg-transparent"
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );

  return (
    <nav className="bg-blue-600 text-white sticky top-0 left-0 w-full z-50 shadow-md backdrop-blur-sm bg-opacity-95 transition-all duration-300">
      <div className="w-full px-4 md:px-8 py-3 flex items-center justify-between">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="buildAble" className="w-8 h-8 object-contain" />
          <span className="font-bold text-lg">buildAble</span>
        </Link>

        {/* Right: Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          <LinkItem to="/" icon={Home} label="Home" />
          <LinkItem to="/shop" icon={Store} label="Shop" />
          <LinkItem to="/cart" icon={ShoppingCart} label="Cart" />
          <Link
            to="/login"
            className="flex items-center gap-2 text-white hover:text-blue-200 transition"
          >
            <LogIn size={18} />
            <span className="font-semibold">Login</span>
          </Link>
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
          className="md:hidden p-2 rounded-md hover:bg-blue-700 transition"
        >
          {open ? <XIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown with slide motion (like your old version) */}
      <div
        ref={menuRef}
        className={`absolute top-16 left-0 right-0 bg-blue-600 shadow-lg z-50 transform transition-all duration-500 ease-in-out ${
          open
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center py-3 space-y-2">
          <LinkItem to="/" icon={Home} label="Home" />
          <LinkItem to="/shop" icon={Store} label="Shop" />
          <LinkItem to="/cart" icon={ShoppingCart} label="Cart" />
          <LinkItem to="/login" icon={LogIn} label="Login" />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
