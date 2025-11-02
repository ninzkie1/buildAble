import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import config from "../config/config";
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { clearCart } = useCart();
  const { message } = location.state || {};

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) navigate("/orders");
  }, [navigate]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${config.apiUrl}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (res.status === 403 && data.message.includes('not verified')) {
        // Show verification message and send new verification email
        const verificationRes = await fetch(`${config.apiUrl}/api/users/resend-verification`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        });

        if (verificationRes.ok) {
          toast.success(
            <div className="flex flex-col">
              <span className="font-medium">Email not verified</span>
              <span className="text-sm">A new verification email has been sent</span>
            </div>,
            { duration: 5000 }
          );
        } else {
          throw new Error("Failed to send verification email");
        }
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      handleLoginSuccess(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleLoginSuccess = async (userData) => {
    login(userData);
    const pendingCheckout = localStorage.getItem("pendingCheckout");
    if (pendingCheckout) localStorage.removeItem("pendingCheckout");

    if (userData.role) {
      switch (userData.role) {
        case "seller":
          navigate("/sellerHome");
          break;
        case "user":
          navigate("/userHome");
          break;
        case "admin":
          navigate("/adminPanel");
          break;
        default:
          navigate("/");
      }
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.role) {
        switch (user.role) {
          case "seller":
            navigate("/sellerHome");
            break;
          case "user":
            navigate("/userHome");
            break;
          case "admin":
            navigate("/adminPanel");
            break;
          default:
            navigate("/");
        }
      }
    }
  }, [navigate]);

  const handleGoogleLogin = () => {
    window.location.href = `${config.apiUrl}/api/users/auth/google`;
  };

  return (
    <div className="absolute inset-0 w-full min-h-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/bg-login.jpg')",
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#B84937]/90 to-[#7A2B22]/90" />

      {/* Content Container */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-6">
            <img src="/logo.png" alt="BuildAble Logo" className="h-16 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-1">
              Welcome back
            </h2>
            <p className="text-white/90">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-yellow-400 hover:text-yellow-300"
              >
                Sign up
              </Link>
            </p>
          </div>

          {message && (
            <div className="mb-4 p-4 bg-blue-50/90 text-blue-800 rounded-lg">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50/90 border-l-4 border-red-500 p-4 my-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              {/* Email field */}
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-5 w-5 text-gray-300" />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your Email"
                  className="w-full pl-10 pr-3 py-3 bg-white/20 text-white placeholder-gray-300 border border-white/30 rounded-lg focus:ring-yellow-300 focus:border-yellow-300"
                />
              </div>

              {/* Password field */}
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-5 w-5 text-gray-300" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your Password"
                  className="w-full pl-10 pr-10 py-3 bg-white/20 text-white placeholder-gray-300 border border-white/30 rounded-lg focus:ring-yellow-300 focus:border-yellow-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-300 hover:text-gray-100"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-yellow-400 hover:text-yellow-300 transition"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-lg transition"
            >
              Sign in
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              <FcGoogle className="h-5 w-5 mr-2" />
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
