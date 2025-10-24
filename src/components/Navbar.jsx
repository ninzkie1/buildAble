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
import { useCart } from "../context/CartContext";

function Navbar() {
  const { cart } = useCart();
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

  // Update LinkItem component
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

  // Calculate cart items count
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Update LinkItem component for Cart to include counter
  const CartLink = () => (
    <Link
      to="/cart"
      onClick={() => setOpen(false)}
      className="relative flex items-center gap-2 text-white hover:text-orange-200 transition px-3 py-2 rounded-md hover:bg-orange-700/50 md:hover:bg-transparent"
    >
      <ShoppingCart size={18} />
      <span>Cart</span>
      {cartItemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-yellow-400 text-[#B84937] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {cartItemCount}
        </span>
      )}
    </Link>
  );

  return (
    <nav
      className="text-white sticky top-0 left-0 w-full z-50 shadow-md backdrop-blur-sm transition-all duration-300"
      style={{
        background: "linear-gradient(to right, #B84937, #7A2B22)",
      }}
    >
      <div className="w-full h-20 px-4 md:px-8 py-3 flex items-center justify-between">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="buildAble" className="w-20 h-20 object-contain" />
          <span className="font-bold text-lg">buildAble</span>
        </Link>

        {/* Right: Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          <LinkItem to="/" icon={Home} label="Home" />
          <LinkItem to="/shop" icon={Store} label="Shop" />
          <CartLink />
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
          className="md:hidden p-2 rounded-md hover:bg-[#B84937]/50 transition"
        >
          {open ? <XIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        ref={menuRef}
        className={`absolute top-16 left-0 right-0 shadow-lg z-50 transform transition-all duration-500 ease-in-out ${
          open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
        style={{
          background: "linear-gradient(to right, #B84937, #7A2B22)",
        }}
      >
        <div className="flex flex-col items-center py-3 space-y-2">
          <LinkItem to="/" icon={Home} label="Home" />
          <LinkItem to="/shop" icon={Store} label="Shop" />
          <CartLink />
          <LinkItem to="/login" icon={LogIn} label="Login" />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
