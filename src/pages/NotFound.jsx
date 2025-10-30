import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const NotFound = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev === 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="text-center p-8 rounded-lg shadow-2xl bg-white/90 backdrop-blur-sm max-w-2xl mx-4">
        <div className="flex justify-center mb-6">
          <svg 
            className="w-24 h-24 text-[#B84937]" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M19 14v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5m14-2l-3-3m0 0l-3 3m3-3v12M10 3v12m0 0l-3-3m3 3l3-3"
            />
          </svg>
        </div>
        
        <h1 className="text-7xl font-bold text-[#B84937] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Under Construction
        </h2>
        <p className="text-gray-600 mb-8">
          Looks like this page is still being built! Our construction team is working hard to fix this.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#B84937] text-white rounded-lg font-medium hover:bg-[#7A2B22] transition-all duration-300 flex items-center justify-center"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Back to Home
          </button>
          <button 
            onClick={() => navigate('/shop')}
            className="px-6 py-3 border-2 border-[#B84937] text-[#B84937] rounded-lg font-medium hover:bg-[#B84937] hover:text-white transition-all duration-300 flex items-center justify-center"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            Continue Shopping
          </button>
        </div>

        <div className="mt-6 text-gray-500">
          Redirecting to home in <span className="font-bold text-[#B84937]">{count}</span> seconds...
        </div>
      </div>
    </div>
  );
};

export default NotFound;