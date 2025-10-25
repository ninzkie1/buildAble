import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import logo from '/logo.png';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; // Update this import

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { clearCart } = useCart(); // Get clearCart from context
  const { message } = location.state || {};

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) navigate('/orders');
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      handleLoginSuccess(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLoginSuccess = async (userData) => {
    login(userData);

    // Check for pending checkout
    const pendingCheckout = localStorage.getItem("pendingCheckout");
    if (pendingCheckout) {
      localStorage.removeItem("pendingCheckout");
    }

    // Role-based redirect
    if (userData.role) {
      switch (userData.role) {
        case 'seller':
          navigate('/sellerHome');
          break;
        case 'user':
          navigate('/userHome');
          break;
        case 'admin':
          navigate('/adminPanel');
          break;
        default:
          navigate('/');
      }
    } else {
      console.error('No role found in user data:', userData);
      navigate('/'); // Fallback to home page
    }
  };
  
  // Update the useEffect for role check
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.role) {
        switch (user.role) {
          case 'seller':
            navigate('/sellerHome');
            break;
          case 'user':
            navigate('/userHome');
            break;
          case 'admin':
            navigate('/adminPanel');
            break;
          default:
            navigate('/');
        }
      }
    }
  }, [navigate]);

  const handleGoogleLogin = () => {
    // Redirect to your backend Google OAuth route
    window.location.href = 'http://localhost:5000/api/users/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 flex items-center justify-center">
            <img src={logo} alt="BuildAble Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            {/* Email field */}
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your Email"
                className="block w-full pl-10 pr-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Password field */}
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your Password"
                className="block w-full pl-10 pr-10 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? 
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : 
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                }
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign in
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="group relative w-full flex items-center justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
          >
            <FcGoogle className="h-5 w-5 mr-2" />
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
}
