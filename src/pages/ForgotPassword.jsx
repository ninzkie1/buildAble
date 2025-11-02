import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import config from "../config/config";
import { toast } from 'react-hot-toast';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${config.apiUrl}/api/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        toast.success("Password reset link sent! Please check your email.");
      } else {
        setError(data.message || "Failed to send password reset email");
        toast.error(data.message || "Failed to send password reset email");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
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
          <Link
            to="/login"
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition"
          >
            <ArrowLeft size={20} />
            <span>Back to Login</span>
          </Link>

          <div className="flex flex-col items-center mb-6">
            <img src="/logo.png" alt="BuildAble Logo" className="h-16 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-1">
              {success ? "Check Your Email" : "Forgot Password"}
            </h2>
            <p className="text-white/90 text-center">
              {success
                ? "We've sent a password reset link to your email."
                : "Enter your email address and we'll send you a link to reset your password."}
            </p>
          </div>

          {error && (
            <div className="bg-red-50/90 border-l-4 border-red-500 p-4 my-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="bg-green-50/90 border-l-4 border-green-500 p-4 my-4">
                <p className="text-green-700">
                  If an account with that email exists, a password reset link has been sent.
                  Please check your email inbox and spam folder.
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-lg transition"
                >
                  Back to Login
                </button>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                  className="w-full py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition"
                >
                  Send Another Email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-5 w-5 text-gray-300" />
                <input
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your Email"
                  className="w-full pl-10 pr-3 py-3 bg-white/20 text-white placeholder-gray-300 border border-white/30 rounded-lg focus:ring-yellow-300 focus:border-yellow-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

