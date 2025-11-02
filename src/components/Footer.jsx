import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import logo from "/logo.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-300 w-full">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 md:pt-12 pb-0 mx-auto">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 w-full mb-6 sm:mb-8 md:mb-10">
          {/* Brand Section */}
          <div className="space-y-3 sm:space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 sm:gap-3 group">
              <img
                src={logo}
                alt="buildAble"
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain transition-transform duration-200 group-hover:scale-110"
              />
              <span className="text-base sm:text-lg md:text-xl font-bold text-white">
                buildAble
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xs leading-relaxed">
              Quality tools and parts for every maker. Building dreams, one tool at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/userHome" className="hover:text-white transition-colors duration-200 inline-block hover:translate-x-1 transform">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/#about" className="hover:text-white transition-colors duration-200 inline-block hover:translate-x-1 transform">
                  About
                </Link>
              </li>
              <li>
                <Link to="/#contact" className="hover:text-white transition-colors duration-200 inline-block hover:translate-x-1 transform">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors duration-200 inline-block hover:translate-x-1 transform">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">
              Contact
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li className="flex items-start gap-3">
                <Phone size={18} className="flex-shrink-0 mt-0.5 text-[#B84937]" />
                <span className="hover:text-white transition-colors duration-200">+1 (234) 567-8900</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="flex-shrink-0 mt-0.5 text-[#B84937]" />
                <span className="hover:text-white transition-colors duration-200 break-words">contact@buildable.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="flex-shrink-0 mt-0.5 text-[#B84937]" />
                <span className="hover:text-white transition-colors duration-200">123 Builder Street, Construction City, CC 12345</span>
              </li>
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">
              Stay Updated
            </h3>
            <form className="space-y-2 sm:space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#B84937] focus:border-transparent transition-all duration-200 text-white placeholder-gray-500"
              />
              <button className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-[#B84937] to-[#7A2B22] text-white rounded-lg text-xs sm:text-sm font-medium hover:from-[#9E3C2D] hover:to-[#6B2419] transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95">
                Subscribe
              </button>
            </form>

            {/* Social Links */}
            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <a
                href="#"
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:text-white hover:bg-[#B84937] transition-all duration-200 rounded-full bg-gray-800"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href="#"
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:text-white hover:bg-[#B84937] transition-all duration-200 rounded-full bg-gray-800"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href="#"
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:text-white hover:bg-[#B84937] transition-all duration-200 rounded-full bg-gray-800"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-4 sm:pt-6 pb-4 sm:pb-6 text-xs text-center text-gray-400 w-full">
          <p>&copy; {new Date().getFullYear()} buildAble. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
