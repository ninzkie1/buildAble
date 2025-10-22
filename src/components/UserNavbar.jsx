import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Home,
  Store,
  User,
  Heart,
  LogOut,
  Menu as MenuIcon,
  X as XIcon,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import logo from "/logo.png";

function UserNavbar() {
  const { user, logout } = useContext(AuthContext);
  const { totalItems } = useCart();
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
      )
        setOpen(false);
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
      className="flex items-center gap-2 text-white hover:text-yellow-200 transition px-3 py-1 md:py-2 rounded-md hover:bg-[#a03d2e] text-sm md:text-base"
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );

  return (
    <nav className="bg-[#B84937] text-white sticky top-0 left-0 w-full z-50 shadow-md">
      <div className="w-full px-4 md:px-8 py-2 md:py-3 flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="buildAble"
            className="w-12 md:w-20 h-12 md:h-20 object-contain"
          />
          <span className="font-bold text-lg md:text-xl">buildAble</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <LinkItem to="/" icon={Home} label="Home" />
          <LinkItem to="/shop" icon={Store} label="Shop" />
          <Link
            to="/cart"
            className="relative flex items-center gap-2 text-white hover:text-yellow-200 transition px-3 py-1 md:py-2 rounded-md hover:bg-[#a03d2e]"
          >
            <ShoppingCart size={20} />
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-3 bg-yellow-400 text-[#B84937] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <LinkItem to="/wishlist" icon={Heart} label="Wishlist" />
          <LinkItem to="/profile" icon={User} label={user?.name || "Profile"} />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white hover:text-yellow-200 px-3 py-1 md:py-2 rounded-md hover:bg-[#a03d2e]"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          ref={btnRef}
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-md hover:bg-[#a03d2e] transition"
        >
          {open ? <XIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div
        ref={menuRef}
        className={`absolute top-16 md:top-20 left-0 right-0 bg-[#B84937] shadow-lg z-50 transform transition-all duration-500 ease-in-out ${
          open
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center py-2 md:py-3 space-y-1 md:space-y-2">
          <LinkItem to="/" icon={Home} label="Home" />
          <LinkItem to="/shop" icon={Store} label="Shop" />
          <LinkItem to="/cart" icon={ShoppingCart} label="Cart" />
          <LinkItem to="/wishlist" icon={Heart} label="Wishlist" />
          <LinkItem to="/profile" icon={User} label={user?.name || "Profile"} />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white hover:text-yellow-200 w-full px-3 py-2 rounded-md hover:bg-[#a03d2e]"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default UserNavbar;
