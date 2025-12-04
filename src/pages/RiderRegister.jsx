import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Phone,
  MapPin,
  Eye, 
  EyeOff, 
  Loader2,
  CheckCircle2,
  Bike
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import config from '../config/config';

export default function RiderRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Philippines'
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const baseInputClasses =
    'w-full rounded-lg border border-white/30 bg-white/20 text-sm text-white placeholder-gray-300 transition duration-200 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300 focus:ring-offset-0 sm:text-base';
  const iconInputClasses = `${baseInputClasses} pl-10 pr-3 py-2.5 sm:py-3`;
  const iconInputWithToggleClasses = `${baseInputClasses} pl-10 pr-10 py-2.5 sm:py-3`;
  const simpleInputClasses = `${baseInputClasses} px-3 py-2.5 sm:py-3`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.phoneNumber) {
      setError('All fields are required');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (!formData.address.street || !formData.address.city || !formData.address.state || !formData.address.postalCode || !formData.address.country) {
      setError('Complete address is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      toast.error(error || 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${config.apiUrl}/api/users/register/rider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          address: formData.address
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
        }
      );

      setTimeout(() => {
        navigate('/rider/login');
      }, 2000);

    } catch (err) {
      toast.error(err.message || 'Registration failed');
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-y-auto bg-black">
      {/* Background Image */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 h-full w-full bg-cover bg-center bg-no-repeat transition-transform duration-300 sm:scale-105 lg:scale-100"
        style={{ backgroundImage: "url('/bg-login.jpg')" }}
      />

      {/* Gradient Overlay */}
      <div className="pointer-events-none fixed inset-0 h-full w-full bg-gradient-to-r from-[#B84937]/95 via-[#8C362C]/90 to-[#7A2B22]/85" />

      {/* Content Container */}
      <div className="relative z-10 flex w-full min-h-screen flex-col items-center justify-center px-3 py-6 sm:px-6 sm:py-10 lg:px-10 lg:py-14">
        <div className="w-full max-w-full rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl sm:max-w-2xl sm:rounded-3xl sm:p-6 lg:p-8">
          <div className="mb-5 flex flex-col items-center text-center sm:mb-6">
            <img src="/logo.png" alt="BuildAble Logo" className="mb-4 h-12 sm:h-14 md:h-16" />
            <h2 className="mb-1 text-base font-bold text-white sm:text-2xl">
              Register as Delivery Rider
            </h2>
            <p className="text-xs text-white/80 sm:text-base">Complete your profile to start delivering</p>
          </div>

          {error && (
            <div className="my-4 rounded border-l-4 border-red-500 bg-red-50/90 p-4 text-sm text-red-700 sm:text-base">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
              {/* Name field */}
              <div className="relative flex items-center">
                <User className="absolute left-3 h-5 w-5 text-gray-300" />
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className={iconInputClasses}
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
                  placeholder="Email Address"
                  className={iconInputClasses}
                />
              </div>

              {/* Phone Number field */}
              <div className="relative flex items-center">
                <Phone className="absolute left-3 h-5 w-5 text-gray-300" />
                <input
                  name="phoneNumber"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className={iconInputClasses}
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
                  className={iconInputWithToggleClasses}
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
                  placeholder="Confirm Password"
                  className={iconInputWithToggleClasses}
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

            {/* Address Section */}
            <div className="border-t border-white/30 pt-4">
              <div className="mb-3 flex items-center gap-2 sm:mb-4">
                <MapPin className="h-5 w-5 text-yellow-300" />
                <h3 className="text-sm font-semibold text-white sm:text-lg">Address</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                {/* Street */}
                <div className="md:col-span-2">
                  <input
                    name="address.street"
                    type="text"
                    required
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="Street Address"
                    className={simpleInputClasses}
                  />
                </div>

                {/* City */}
                <div>
                  <input
                    name="address.city"
                    type="text"
                    required
                    value={formData.address.city}
                    onChange={handleChange}
                    placeholder="City"
                    className={simpleInputClasses}
                  />
                </div>

                {/* State/Province */}
                <div>
                  <input
                    name="address.state"
                    type="text"
                    required
                    value={formData.address.state}
                    onChange={handleChange}
                    placeholder="State/Province"
                    className={simpleInputClasses}
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <input
                    name="address.postalCode"
                    type="text"
                    required
                    value={formData.address.postalCode}
                    onChange={handleChange}
                    placeholder="Postal Code"
                    className={simpleInputClasses}
                  />
                </div>

                {/* Country */}
                <div>
                  <input
                    name="address.country"
                    type="text"
                    required
                    value={formData.address.country}
                    onChange={handleChange}
                    placeholder="Country"
                    className={simpleInputClasses}
                  />
                </div>
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
                  Creating account...
                </>
              ) : (
                <>
                  <Bike className="h-5 w-5 mr-2" />
                  Register as Rider
                </>
              )}
            </button>

            <p className="text-center text-sm text-white/90 sm:text-base">
              Already have an account?{' '}
              <Link to="/rider/login" className="text-yellow-400 hover:text-yellow-300 font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}



