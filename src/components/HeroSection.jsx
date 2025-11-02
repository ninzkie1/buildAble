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
    <section className="relative w-full overflow-hidden min-h-[600px] sm:min-h-[550px] md:min-h-[600px] lg:min-h-[650px] flex items-center" style={{ paddingTop: 0, marginTop: 0 }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/hero-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#B84937]/95 via-[#B84937]/90 to-[#7A2B22]/95" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-24 max-w-7xl mx-auto w-full gap-6 sm:gap-8 lg:gap-12">
        <div className="w-full lg:w-1/2 text-center lg:text-left space-y-3 sm:space-y-4 md:space-y-6 order-2 lg:order-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold leading-tight text-white drop-shadow-lg">
            Professional Construction Tools
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 md:mb-8 text-white/95 drop-shadow max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Quality tools for professionals and DIY enthusiasts. Shop our
            extensive collection of power tools, hand tools, and equipment.
          </p>
          <div className="flex justify-center lg:justify-start pt-2">
            <button
              onClick={handleShopNowClick}
              className="inline-flex items-center justify-center px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-white text-[#B84937] rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 text-sm sm:text-base md:text-lg"
            >
              Shop Now
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ml-2"
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
        </div>

        <div className="w-full lg:w-1/2 mt-0 mb-4 lg:mb-0 lg:mt-0 flex justify-center order-1 lg:order-2">
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-96 lg:h-96 rounded-full bg-white/95 p-3 sm:p-4 md:p-6 shadow-2xl backdrop-blur-sm ring-4 ring-white/20 hover:scale-105 transition-transform duration-300">
            <img
              src="/logo.png"
              alt="Construction Tools"
              className="w-full h-full object-contain rounded-full"
              style={{
                filter: "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15))",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};