import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Home,
  LogIn,
  Menu as MenuIcon,
  X as XIcon,
  Info,
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

  // Close menu on outside click or ESC
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

  // Reusable link item - Professional style for mobile, simple for desktop
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

  // Cart item count
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Cart link with badge - hidden on mobile (using floating cart instead)
  const CartLink = () => (
    <Link
      to="/cart"
      onClick={() => setOpen(false)}
      className="hidden md:flex relative items-center gap-2 text-white hover:text-orange-200 transition px-3 py-2 rounded-md hover:bg-[#B84937]/50"
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

  // About link with smooth scroll - Professional style for mobile, simple for desktop
  const AboutLink = () => (
    <Link
      to="/#about"
      onClick={(e) => {
        e.preventDefault();
        if (window.location.pathname === "/") {
          const aboutSection = document.querySelector(
            ".full-width-section:nth-of-type(4)"
          );
          aboutSection?.scrollIntoView({ behavior: "smooth" });
        } else {
          window.location.href = "/#about";
        }
        setOpen(false);
      }}
      className="flex items-center gap-2.5 md:gap-2 text-white/90 md:text-white hover:text-white md:hover:text-orange-200 transition-all duration-200 md:transition px-4 md:px-3 py-2.5 md:py-2 rounded-lg md:rounded-md hover:bg-white/10 md:hover:bg-[#B84937]/50 md:hover:bg-transparent font-medium md:font-normal text-sm md:text-base tracking-wide md:tracking-normal"
    >
      <Info size={18} className="stroke-[1.5] md:stroke-2" />
      <span>About</span>
    </Link>
  );

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-[#B84937] via-[#B84937] to-[#7A2B22] text-white shadow-xl backdrop-blur-md transition-all duration-300 border-b border-white/10"
    >
      <div className="w-full md:max-w-none max-w-7xl mx-auto px-4 md:px-8 py-2 md:py-3 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 md:gap-2 group transition-transform duration-200 hover:scale-105 md:hover:scale-100 md:transition-none">
          <img src={logo} alt="buildAble" className="w-12 h-12 md:w-20 md:h-20 object-contain drop-shadow-lg" />
          <span className="font-bold text-xl md:text-lg tracking-tight md:tracking-normal group-hover:text-white/95 md:group-hover:text-white transition-colors md:transition-none">
            buildAble
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <LinkItem to="/" icon={Home} label="Home" />
          <CartLink />
          <AboutLink />
          <LinkItem to="/login" icon={LogIn} label="Login" />
        </div>

        {/* Mobile Burger Button */}
        <button
          ref={btnRef}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className="md:hidden p-2.5 rounded-lg hover:bg-white/10 transition-all duration-200 active:scale-95"
        >
          {open ? <XIcon size={24} className="stroke-[1.5]" /> : <MenuIcon size={24} className="stroke-[1.5]" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div
        ref={menuRef}
        className={`absolute top-16 md:top-20 left-0 right-0 shadow-2xl z-50 transform transition-all duration-300 ease-out ${
          open
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        } bg-gradient-to-b from-[#B84937] via-[#B84937] to-[#7A2B22] border-t border-white/10`}
      >
        <div className="flex flex-col items-stretch px-4 py-4 space-y-1">
          <LinkItem to="/" icon={Home} label="Home" />
          {/* Cart hidden on mobile - using floating cart instead */}
          <AboutLink />
          <div className="h-px bg-white/10 my-2"></div>
          <LinkItem to="/login" icon={LogIn} label="Login" />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
