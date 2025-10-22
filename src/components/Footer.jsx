import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import logo from "/logo.png";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 w-full">
      <div className="w-full max-w-full px-4 py-8 md:py-12 mx-auto">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src={logo}
                alt="buildAble"
                className="w-10 h-10 md:w-12 md:h-12 object-contain"
              />
              <span className="text-lg md:text-xl font-bold text-white">
                buildAble
              </span>
            </Link>
            <p className="text-sm md:text-base text-gray-400 max-w-xs">
              Quality tools and parts for every maker. Building dreams, one tool at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div className="hidden sm:block">
            <h3 className="font-semibold text-white mb-4 text-sm md:text-base">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm md:text-base">
              <li>
                <Link to="/shop" className="hover:text-white transition inline-block">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition inline-block">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition inline-block">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition inline-block">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm md:text-base">
              Contact
            </h3>
            <ul className="space-y-2 text-sm md:text-base">
              <li className="flex items-center gap-2">
                <Phone size={16} className="flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2 break-words">
                <Mail size={16} className="flex-shrink-0" />
                <span>support@buildable.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="flex-shrink-0" />
                <span>123 Maker St, CA 90210</span>
              </li>
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm md:text-base">
              Stay Updated
            </h3>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 bg-gray-800 rounded-md text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="w-full px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-md text-sm md:text-base hover:opacity-90 transition">
                Subscribe
              </button>
            </form>

            {/* Social Links */}
            <div className="flex gap-4 mt-4">
              <a
                href="#"
                className="hover:text-white transition p-2 hover:bg-gray-800 rounded-full"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="hover:text-white transition p-2 hover:bg-gray-800 rounded-full"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="hover:text-white transition p-2 hover:bg-gray-800 rounded-full"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 md:mt-12 pt-4 md:pt-6 text-xs md:text-sm text-center text-gray-400 w-full">
          <p>&copy; {new Date().getFullYear()} buildAble. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
