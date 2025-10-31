import { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import config from '../config/config';

export default function GoogleAuth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const handleGoogleAuth = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${config.apiUrl}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const userData = await response.json();
        login({ ...userData, token });
        navigate('/userHome');
      } catch (error) {
        console.error('Google auth error:', error);
        navigate('/login?error=auth_failed');
      }
    };

    handleGoogleAuth();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
    </div>
  );
}