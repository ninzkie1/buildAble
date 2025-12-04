import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2,
  Bike
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import config from '../config/config';
import { toast } from 'react-hot-toast';

export default function RiderLoginPage() {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${config.apiUrl}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Check if user is a rider
      if (data.role !== 'rider') {
        throw new Error('This account is not registered as a delivery rider');
      }

      // Login using AuthContext - pass the full user data object
      login({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token
      });

      toast.success('Login successful!');
      
      // Navigate to rider dashboard
      setTimeout(() => {
        navigate('/rider/dashboard');
        window.location.reload(); // Reload to ensure proper state
      }, 100);

    } catch (err) {
      toast.error(err.message || 'Login failed');
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 w-full min-h-screen overflow-hidden">
      {/* Background Image */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat transition-transform duration-300 sm:scale-105 lg:scale-100"
        style={{
          backgroundImage: "url('/bg-login.jpg')",
        }}
      />

      {/* Gradient Overlay */}
      <div className="pointer-events-none absolute inset-0 h-full w-full bg-gradient-to-r from-[#B84937]/95 via-[#8C362C]/90 to-[#7A2B22]/85" />

      {/* Content Container */}
      <div className="relative z-10 flex w-full min-h-screen flex-col items-center justify-center overflow-y-auto px-3 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-12">
        <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:max-w-md sm:p-7 lg:max-w-lg lg:p-8">
          <div className="mb-5 flex flex-col items-center text-center sm:mb-6">
            <img src="/logo.png" alt="BuildAble Logo" className="mb-4 h-12 sm:h-14 md:h-16" />
            <h2 className="mb-1 text-xl font-bold text-white sm:text-2xl">
              Rider Login
            </h2>
            <p className="text-xs text-white/80 sm:text-base">Sign in to your delivery rider account</p>
          </div>

          {error && (
            <div className="my-4 rounded border-l-4 border-red-500 bg-red-50/90 p-4 text-sm text-red-700 sm:text-base">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-5 sm:space-y-6">
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
                  placeholder="Email Address"
                  className="w-full rounded-lg border border-white/30 bg-white/20 py-2.5 pl-10 pr-3 text-sm text-white placeholder-gray-300 transition duration-200 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300 focus:ring-offset-0 sm:py-3 sm:text-base"
                />
              </div>

              {/* Password field */}
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-5 w-5 text-gray-300" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full rounded-lg border border-white/30 bg-white/20 py-2.5 pl-10 pr-10 text-sm text-white placeholder-gray-300 transition duration-200 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300 focus:ring-offset-0 sm:py-3 sm:text-base"
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

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full min-h-[48px] items-center justify-center rounded-xl border border-transparent bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[52px] sm:text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                  Signing in...
                </>
              ) : (
                <>
                  <Bike className="h-5 w-5 mr-2" />
                  Sign In
                </>
              )}
            </button>

            <p className="text-center text-sm text-white/90 sm:text-base">
              Don't have an account?{' '}
              <Link to="/rider/register" className="text-yellow-400 hover:text-yellow-300 font-medium">
                Register as Rider
              </Link>
            </p>

            <div className="text-center text-xs text-white/80 sm:mt-2 sm:text-sm">
              <Link to="/login" className="hover:text-white">
                Login as User or Seller
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

