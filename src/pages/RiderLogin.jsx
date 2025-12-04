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
              Rider Login
            </h2>
            <p className="text-white/80 text-sm">Sign in to your delivery rider account</p>
          </div>

          {error && (
            <div className="bg-red-50/90 border-l-4 border-red-500 p-4 my-4 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-6">
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
                  className="w-full pl-10 pr-3 py-3 bg-white/20 text-white placeholder-gray-300 border border-white/30 rounded-lg focus:ring-yellow-300 focus:border-yellow-300"
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

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200 disabled:opacity-50"
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

            <p className="text-white/90 text-center">
              Don't have an account?{' '}
              <Link to="/rider/register" className="text-yellow-400 hover:text-yellow-300 font-medium">
                Register as Rider
              </Link>
            </p>

            <div className="mt-4 text-center">
              <Link to="/login" className="text-white/80 hover:text-white text-sm">
                Login as User or Seller
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

