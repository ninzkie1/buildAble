import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

export const FloatingCart = () => {
  const { totalItems } = useCart();

  return (
    <Link
      to="/cart"
      className="fixed bottom-6 right-6 z-50 md:hidden"
      aria-label="Go to cart"
    >
      <div className="relative">
        <button className="bg-[#B84937] hover:bg-[#9E3C2D] text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95">
          <ShoppingCart size={24} />
        </button>
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-400 text-[#B84937] text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </div>
    </Link>
  );
};

export default FloatingCart;

