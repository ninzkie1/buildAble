import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, UserCircle, Store, X, ShoppingBag } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import config from "../config/config";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { clearCart } = useCart();
  const { message } = location.state || {};

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user"
  });
  const [registrationError, setRegistrationError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [oauthPopup, setOauthPopup] = useState(null);

  /** -----------------------------
   *  Redirect user if already logged in
   *  Runs only once to avoid infinite loop
   * ----------------------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    // Only redirect if we're on the login page — avoid every render navigation
    if (location.pathname !== "/login") return;

    const user = JSON.parse(storedUser);
    const getTargetPath = (role) => {
      switch (role) {
        case "seller":
          return "/sellerHome";
        case "user":
          return "/userHome";
        case "admin":
          return "/adminPanel";
        default:
          return "/";
      }
    };

    const target = getTargetPath(user.role);
    // Do not navigate if we're already on the target (prevents update loop)
    if (location.pathname !== target) {
      navigate(target, { replace: true });
    }
  }, [location.pathname, navigate]); // run whenever location or navigate changes

  /** -----------------------------
   *  Handle email/password login
   * ----------------------------- */
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

      if (res.status === 403 && data.message.includes("not verified")) {
        // Resend verification email
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

      if (!res.ok) throw new Error(data.message || "Login failed");

      handleLoginSuccess(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  /** -----------------------------
   *  Common function for login success
   * ----------------------------- */
  const handleLoginSuccess = (userData) => {
    login(userData);
    localStorage.removeItem("pendingCheckout");

    if (userData.needsRoleSelection) {
      navigate("/select-role");
      return;
    }

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
        case "rider":
          navigate("/rider/dashboard");
          break;
        default:
          navigate("/");
      }
    } else {
      navigate("/");
    }
  };

  /** -----------------------------
   *  Google OAuth Login
   * ----------------------------- */
  const isPopupClosed = (popup) => {
    try {
      return !popup || popup.closed;
    } catch (err) {
      return false; // COOP blocks access
    }
  };

  useEffect(() => {
    return () => {
      try {
        if (oauthPopup && !isPopupClosed(oauthPopup)) oauthPopup.close();
      } catch (err) {}
    };
  }, [oauthPopup]);

  const handleGoogleLogin = async () => {
    try {
      if (oauthPopup && !isPopupClosed(oauthPopup)) oauthPopup.close();
      setIsGoogleLoading(true);

      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      const state = Math.random().toString(36).substring(2);
      localStorage.setItem("oauth_state", state);

      const popup = window.open(
        `${config.apiUrl}/api/users/auth/google?state=${state}`,
        "google-login",
        `width=${width},height=${height},top=${top},left=${left}`
      );
      setOauthPopup(popup);

      if (!popup) throw new Error("Popup was blocked. Please allow popups for this site.");

      const messageHandler = (event) => {
        if (event.origin !== window.location.origin) return;
        if (event.data.type === "oauth_success") {
          handleOAuthSuccess(event.data.user);
          window.removeEventListener("message", messageHandler);
        }
      };

      window.addEventListener("message", messageHandler);

      let pingMisses = 0;
      const popupHealthInterval = setInterval(() => {
        try {
          if (isPopupClosed(popup)) {
            clearInterval(popupHealthInterval);
            window.removeEventListener("message", messageHandler);
            const user = JSON.parse(localStorage.getItem("user") || "null");
            if (user) handleOAuthSuccess(user);
            else if (isGoogleLoading) {
              setIsGoogleLoading(false);
              toast.error("Google login was interrupted. Please try again.");
            }
          } else {
            try {
              popup.postMessage({ type: "parent_ping" }, window.location.origin);
              pingMisses = 0;
            } catch (err) {
              pingMisses++;
              if (pingMisses >= 3) {
                clearInterval(popupHealthInterval);
                window.removeEventListener("message", messageHandler);
                const user = JSON.parse(localStorage.getItem("user") || "null");
                if (user) handleOAuthSuccess(user);
                else if (isGoogleLoading) {
                  setIsGoogleLoading(false);
                  toast.error("Google login was interrupted. Please try again.");
                }
              }
            }
          }
        } catch (err) {
          clearInterval(popupHealthInterval);
          window.removeEventListener("message", messageHandler);
          const user = JSON.parse(localStorage.getItem("user") || "null");
          if (user) handleOAuthSuccess(user);
          else if (isGoogleLoading) {
            setIsGoogleLoading(false);
            toast.error("Google login was interrupted. Please try again.");
          }
        }
      }, 500);

      const timeoutId = setTimeout(() => {
        clearInterval(popupHealthInterval);
        if (isGoogleLoading) {
          try { popup.close(); } catch (e) {}
          setIsGoogleLoading(false);
          toast.error("Login timed out. Please try again.");
        }
      }, 120000);

      return () => {
        clearInterval(popupHealthInterval);
        clearTimeout(timeoutId);
      };
    } catch (err) {
      console.error("Google login error:", err);
      toast.error(err.message || "Failed to start Google login");
      setIsGoogleLoading(false);
    }
  };

  const handleOAuthSuccess = (user) => {
    setIsGoogleLoading(false);
    try {
      if (oauthPopup && !isPopupClosed(oauthPopup)) oauthPopup.close();
    } catch (e) {}
    setOauthPopup(null);

    // Log the user in and persist state
    try {
      login(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('pendingCheckout');
    } catch (err) {
      // ignore if login fails; continue to navigation
    }

    // If the user must select a role, let them do that
    if (user?.needsRoleSelection) {
      navigate('/select-role');
      // refresh the app so any global state picks up the new user
      setTimeout(() => window.location.reload(), 250);
      return;
    }

    if (!user.role) {
      setRegistrationData(prev => ({ ...prev, email: user.email, name: user.name || "" }));
      setShowRegistrationModal(true);
    } else {
      switch (user.role) {
        case "seller":
          navigate("/sellerHome");
          break;
        case "admin":
          navigate("/adminPanel");
          break;
        case "rider":
          navigate("/rider/dashboard");
          break;
        case "user":
        default:
          navigate("/userHome");
      }
      // Refresh to ensure entire app reflects new login state
      setTimeout(() => window.location.reload(), 250);
    }
  };

  /** -----------------------------
   *  Registration Modal Handlers
   * ----------------------------- */
  const handleRegistrationChange = (e) => {
    const { name, value } = e.target;
    setRegistrationData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setRegistrationError("");

    if (registrationData.password !== registrationData.confirmPassword) {
      setRegistrationError("Passwords do not match");
      return;
    }
    if (registrationData.password.length < 6) {
      setRegistrationError("Password must be at least 6 characters");
      return;
    }

    setIsRegistering(true);

    try {
      const response = await fetch(`${config.apiUrl}/api/users/complete-registration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
        credentials: "include"
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");

      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...currentUser, ...data.user }));

      setShowRegistrationModal(false);
      if (data.user.role === "seller") navigate("/sellerHome");
      else navigate("/userHome");
      toast.success("Registration completed successfully!");
    } catch (err) {
      setRegistrationError(err.message || "Failed to complete registration");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSignUpClick = (e) => {
    e.preventDefault();
    setShowSignUpModal(true);
  };

  const handleNavigation = (path) => {
    setShowSignUpModal(false);
    navigate(path);
  };

  /** -----------------------------
   *  Render
   * ----------------------------- */
  return (
    <div className="absolute inset-0 w-full min-h-screen overflow-hidden">
      {/* Background and gradient overlay */}
      <div className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/bg-login.jpg')" }} />
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#B84937]/90 to-[#7A2B22]/90" />

      {/* Content */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <img src="/logo.png" alt="BuildAble Logo" className="h-16 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-white/90">
              Don't have an account?{" "}
              <button onClick={handleSignUpClick} className="text-orange-500 hover:text-orange-400 focus:outline-none font-medium">Sign up</button>
            </p>
          </div>

          {message && <div className="mb-4 p-4 bg-blue-50/90 text-blue-800 rounded-lg">{message}</div>}
          {error && <div className="bg-red-50/90 border-l-4 border-red-500 p-4 my-4"><p className="text-red-700">{error}</p></div>}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Email */}
            <div className="relative flex items-center">
              <Mail className="absolute left-3 h-5 w-5 text-gray-300" />
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your Email"
                className="w-full pl-10 pr-3 py-3 bg-white/20 text-white placeholder-gray-300 border border-white/30 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Password */}
            <div className="relative flex items-center">
              <Lock className="absolute left-3 h-5 w-5 text-gray-300" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your Password"
                className="w-full pl-10 pr-10 py-3 bg-white/20 text-white placeholder-gray-300 border border-white/30 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-gray-300 hover:text-gray-100">
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-orange-500 hover:text-orange-400 transition font-medium">Forgot Password?</Link>
            </div>

            {/* Buttons */}
            <button type="submit" className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-lg transition-colors">Sign in</button>
            <button type="button" onClick={handleGoogleLogin} disabled={isGoogleLoading} className="w-full flex items-center justify-center py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed">
              {isGoogleLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <FcGoogle className="h-5 w-5 mr-2" />
                  Sign in with Google
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Sign Up Modal - Role Selection */}
      {showSignUpModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay matching login page */}
            <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/bg-login.jpg')" }}></div>
            <div className="fixed inset-0 bg-gradient-to-r from-[#B84937]/95 to-[#7A2B22]/95 transition-opacity" aria-hidden="true" onClick={() => setShowSignUpModal(false)}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white/10 backdrop-blur-lg rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 relative">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white/20 backdrop-blur-sm rounded-md text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  onClick={() => setShowSignUpModal(false)}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-extrabold text-white sm:text-3xl mb-2" id="modal-title">
                  Join BuildAble Today
                </h3>
                <p className="text-white/90 mb-6">
                  Choose your account type to get started
                </p>
                
                <div className="mt-6 grid grid-cols-1 gap-4">
                  {/* Buyer Card */}
                  <div 
                    onClick={() => handleNavigation('/register')}
                    className="relative p-6 border border-white/30 bg-white/10 backdrop-blur-sm rounded-lg cursor-pointer hover:border-orange-500 hover:bg-white/20 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-orange-500/20 backdrop-blur-sm border border-orange-500/30">
                        <ShoppingBag className="h-6 w-6 text-orange-400" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-white">I'm a Buyer</h4>
                        <p className="text-sm text-white/80">Shop for construction materials</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Seller Card */}
                  <div 
                    onClick={() => handleNavigation('/seller/register')}
                    className="relative p-6 border border-white/30 bg-white/10 backdrop-blur-sm rounded-lg cursor-pointer hover:border-orange-500 hover:bg-white/20 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-orange-500/20 backdrop-blur-sm border border-orange-500/30">
                        <Store className="h-6 w-6 text-orange-400" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-white">I'm a Seller</h4>
                        <p className="text-sm text-white/80">Sell your construction materials</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-sm text-white/90">
                    Already have an account?{' '}
                    <button 
                      onClick={() => setShowSignUpModal(false)}
                      className="font-medium text-orange-500 hover:text-orange-400 hover:underline focus:outline-none"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal - For OAuth users completing registration */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
            {/* Close button */}
            <button onClick={() => setShowRegistrationModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Complete Your Registration</h3>
            
            {registrationError && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4"><p className="text-red-700">{registrationError}</p></div>}
            
            {/* Registration form */}
            <form onSubmit={handleRegistrationSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="text" name="name" required value={registrationData.name} onChange={handleRegistrationChange} placeholder="Enter your full name" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-300 focus:border-yellow-300" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="email" name="email" required value={registrationData.email} onChange={handleRegistrationChange} placeholder="Enter your email" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-300 focus:border-yellow-300" disabled={!!registrationData.email} />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="password" name="password" required value={registrationData.password} onChange={handleRegistrationChange} placeholder="Enter password" className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-300 focus:border-yellow-300" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input type="password" name="confirmPassword" required value={registrationData.confirmPassword} onChange={handleRegistrationChange} placeholder="Confirm password" className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-300 focus:border-yellow-300" />
              </div>

              {/* Submit */}
              <button type="submit" disabled={isRegistering} className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition">
                {isRegistering ? "Registering..." : "Complete Registration"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
