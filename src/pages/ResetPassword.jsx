import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import config from "../config/config";
import { toast } from 'react-hot-toast';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      toast.error("Invalid reset link");
    }
  }, [token]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${config.apiUrl}/api/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: formData.password
        }),
      });
      
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        toast.success("Password reset successfully! Redirecting to login...");
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.message || "Failed to reset password");
        toast.error(data.message || "Failed to reset password");
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
              {success ? "Password Reset Successfully!" : "Reset Password"}
            </h2>
            <p className="text-white/90 text-center">
              {success
                ? "Your password has been reset. Redirecting to login..."
                : "Enter your new password below."}
            </p>
          </div>

          {error && (
            <div className="bg-red-50/90 border-l-4 border-red-500 p-4 my-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success ? (
            <div className="bg-green-50/90 border-l-4 border-green-500 p-4 my-4">
              <p className="text-green-700">
                Your password has been successfully reset. You will be redirected to the login page shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-4">
                {/* Password field */}
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 h-5 w-5 text-gray-300" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter New Password"
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

                {/* Confirm Password field */}
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 h-5 w-5 text-gray-300" />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm New Password"
                    className="w-full pl-10 pr-10 py-3 bg-white/20 text-white placeholder-gray-300 border border-white/30 rounded-lg focus:ring-yellow-300 focus:border-yellow-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-gray-300 hover:text-gray-100"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

