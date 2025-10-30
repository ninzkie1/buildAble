import { Link, useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const navigate = useNavigate();
  
  // Add function to handle authentication check
  const handleShopNowClick = (e) => {
    e.preventDefault();
    // Check if user is authenticated (assuming you have a token in localStorage)
    const token = localStorage.getItem('token'); // or however you store your auth token
    
    if (token) {
      navigate('/userHome');
    } else {
      navigate('/login');
    }
  };

  return (
    <section className="relative w-full overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/hero-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#B84937]/90 to-[#7A2B22]/90" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-4 py-12 md:py-20 max-w-7xl mx-auto w-full">
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white drop-shadow-md">
            Professional Construction Tools
          </h1>
          <p className="text-base md:text-lg mb-6 md:mb-8 text-white drop-shadow">
            Quality tools for professionals and DIY enthusiasts. Shop our
            extensive collection of power tools, hand tools, and equipment.
          </p>
          {/* Replace Link with button */}
          <button
            onClick={handleShopNowClick}
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#B84937] rounded-lg font-medium hover:bg-gray-100 transition shadow-lg"
          >
            Shop Now
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
          <div className="relative w-64 h-64 md:w-96 md:h-96 rounded-full bg-white/95 p-4 shadow-xl backdrop-blur-sm">
            <img
              src="/logo.png"
              alt="Construction Tools"
              className="w-full h-full object-contain rounded-full"
              style={{
                filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};