import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import config from '../config/config';
import { toast } from 'react-hot-toast';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const navigate = useNavigate();

  const verifyToken = useCallback(async () => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      toast.error('Verification token is missing', { id: 'verify-error' });
      return;
    }

    try {
      const response = await fetch(`${config.apiUrl}/api/users/verify-email?token=${token}`);
      const data = await response.json();

      // Dismiss any existing toasts
      toast.dismiss();

      if (response.ok) {
        setStatus('success');
        // Show success toast with ID
        toast.success(data.message || 'Email verified successfully!', {
          id: 'verify-success',
          duration: 2000,
        });
        
        // Navigate after toast duration
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        throw new Error(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      // Show error toast with ID
      toast.error(error.message || 'Verification failed', {
        id: 'verify-error',
        duration: 4000
      });
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    // Dismiss any existing toasts on mount
    toast.dismiss();
    verifyToken();

    // Cleanup function to dismiss toasts on unmount
    return () => toast.dismiss();
  }, [verifyToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'verifying' && (
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">Verifying your email...</h2>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#B84937]"></div>
              </div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-green-600">Email verified successfully!</h2>
              <p className="text-gray-600">Redirecting you to login...</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-red-600">Verification failed</h2>
              <p className="text-gray-600">The verification link is invalid or has expired.</p>
              <button
                onClick={() => navigate('/login')}
                className="mt-4 px-4 py-2 border border-transparent text-sm font-medium 
                         rounded-md text-white bg-[#B84937] hover:bg-[#943728]"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}