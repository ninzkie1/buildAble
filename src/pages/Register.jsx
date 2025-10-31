import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Store, 
  UserCircle, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2 
} from 'lucide-react';
import logo from '/logo.png';
import { AuthContext } from '../context/AuthContext';
import config from '../config/config';
import { toast } from 'react-hot-toast';

export default function RegisterPage() {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${config.apiUrl}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      toast.success(
        (t) => (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium">Registration successful!</p>
              <p className="text-sm text-gray-500">Please check your email to verify your account</p>
            </div>
          </div>
        ),
        {
          duration: 5000,
          position: 'top-center',
          className: 'bg-white shadow-lg rounded-lg p-4',
          icon: false
        }
      );

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      toast.error(err.message || 'Registration failed');
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
            <img src={logo} alt="BuildAble Logo" className="h-16 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-1">Create an account</h2>
            <p className="text-white/90">
              Already have an account?{' '}
              <Link to="/login" className="text-yellow-400 hover:text-yellow-300">
                Sign in
              </Link>
            </p>
          </div>

          {error && (
            <div className="bg-red-50/90 border-l-4 border-red-500 p-4 my-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              {/* Name field */}
              <div className="relative flex items-center">
                <UserCircle className="absolute left-3 h-5 w-5 text-gray-300" />
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your Full Name"
                  className="w-full pl-10 pr-3 py-3 bg-white/20 text-white placeholder-gray-300 border border-white/30 rounded-lg focus:ring-yellow-300 focus:border-yellow-300"
                />
              </div>

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
                  type={showPassword ? 'text' : 'password'}
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

              {/* Confirm Password field */}
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-5 w-5 text-gray-300" />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your Password"
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

              {/* Role selection */}
              <div className="flex justify-between items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/30 hover:border-yellow-300 cursor-pointer flex-1 text-white">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={formData.role === 'user'}
                    onChange={handleChange}
                    className="h-4 w-4 text-yellow-400 focus:ring-yellow-300 border-white/30"
                  />
                  <User className="h-5 w-5" />
                  <span>User</span>
                </label>
                <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/30 hover:border-yellow-300 cursor-pointer flex-1 text-white">
                  <input
                    type="radio"
                    name="role"
                    value="seller"
                    checked={formData.role === 'seller'}
                    onChange={handleChange}
                    className="h-4 w-4 text-yellow-400 focus:ring-yellow-300 border-white/30"
                  />
                  <Store className="h-5 w-5" />
                  <span>Seller</span>
                </label>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400 
                        text-white font-semibold rounded-lg shadow-lg transition 
                        flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <User className="h-5 w-5 mr-2" />
                  Sign up
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
