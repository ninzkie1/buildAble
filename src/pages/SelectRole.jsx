import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import config from "../config/config";
import { toast } from "react-hot-toast";

const roleOptions = [
  {
    id: "user",
    title: "Shopper",
    description: "Browse and purchase items from verified sellers.",
  },
  {
    id: "seller",
    title: "Seller",
    description: "List your products and manage orders from customers.",
  },
];

export default function SelectRole() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectByRole = (role) => {
    switch (role) {
      case "seller":
        navigate("/sellerHome");
        break;
      case "admin":
        navigate("/adminPanel");
        break;
      case "user":
        navigate("/userHome");
        break;
      default:
        navigate("/");
    }
  };

  useEffect(() => {
    // Only run this effect once on component mount
    if (!user) {
      navigate("/login");
      return;
    }

    // Only redirect if user doesn't need role selection
    if (user && !user.needsRoleSelection) {
      redirectByRole(user.role);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount

  const handleSubmit = async () => {
    if (!selectedRole) {
      toast.error("Please select a role to continue");
      return;
    }

    if (!user) return;

    try {
      setIsSubmitting(true);
      const token = user.token || localStorage.getItem("token");

      const response = await fetch(`${config.apiUrl}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update role");
      }

      const updatedUser = {
        ...user,
        role: data.user.role,
        needsRoleSelection: false,
      };

      // Store updated account
      login(updatedUser);

      toast.success("Account created successfully");

      // 🔥 NEW: Handle Google OAuth popup
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "oauth_success",
            user: updatedUser,
          },
          window.location.origin
        );

        // Close popup
        window.close();
        return;
      }

      // Normal redirect (email login)
      redirectByRole(data.user.role);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-0 w-full min-h-screen overflow-hidden">
      {/* Background and gradient overlay */}
      <div className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/bg-login.jpg')" }} />
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#B84937]/90 to-[#7A2B22]/90" />

      {/* Content card */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-3xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.png" alt="BuildAble Logo" className="h-14 mb-2" />
            <h2 className="text-2xl font-bold text-white mb-1">Choose how you want to use BuildAble</h2>
            
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {roleOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedRole(option.id)}
                className={`text-left p-6 border-2 rounded-2xl transition hover:shadow-lg ${
                  selectedRole === option.id
                    ? "border-yellow-400 bg-yellow-500/20 text-white"
                    : "border-white/30 bg-white/5 text-white/90"
                }`}
              >
                <h2 className={`text-xl font-semibold mb-2 ${selectedRole === option.id ? "text-white" : "text-white/90"}`}>
                  {option.title}
                </h2>
                <p className={`text-sm ${selectedRole === option.id ? "text-white/80" : "text-white/70"}`}>{option.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-6 py-3 border border-white/30 rounded-xl text-white/90 hover:bg-white/5"
            >
              Go back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
