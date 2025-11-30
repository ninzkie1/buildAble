import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Store, X } from 'lucide-react';

export const HeroSection = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  
  const handleShopNowClick = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (token) {
      navigate('/userHome');
    } else {
      navigate('/login');
    }
  };

  const handleGetStartedClick = (e) => {
    e.preventDefault();
    setShowModal(true);
  };
  
  const closeModal = () => setShowModal(false);
  
  const handleNavigation = (path) => {
    closeModal();
    navigate(path);
  };

  return (
    <>
      {/* HERO SECTION */}
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
                onClick={handleGetStartedClick}
                className="inline-flex items-center justify-center px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-white text-[#B84937] rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 text-sm sm:text-base md:text-lg"
              >
                Get Started
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
                style={{ filter: "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15))" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* REGISTRATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay matching login page */}
            <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/bg-login.jpg')" }}></div>
            <div className="fixed inset-0 bg-gradient-to-r from-[#B84937]/95 to-[#7A2B22]/95 transition-opacity" aria-hidden="true" onClick={closeModal}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white/10 backdrop-blur-lg rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 relative">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white/20 backdrop-blur-sm rounded-md text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  onClick={closeModal}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-extrabold text-white sm:text-3xl mb-2" id="modal-title">
                  Join BuildAble Today
                </h3>
                <p className="text-white/90 mb-6">
                  Choose your account type to get started
                </p>
                
                <div className="mt-6 grid grid-cols-1 gap-4">
                  {/* Buyer Card */}
                  <div 
                    onClick={() => handleNavigation('/register')}
                    className="relative p-6 border border-white/30 bg-white/10 backdrop-blur-sm rounded-lg cursor-pointer hover:border-orange-500 hover:bg-white/20 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-orange-500/20 backdrop-blur-sm border border-orange-500/30">
                        <ShoppingBag className="h-6 w-6 text-orange-400" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-white">I'm a Buyer</h4>
                        <p className="text-sm text-white/80">Shop for construction materials</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Seller Card */}
                  <div 
                    onClick={() => handleNavigation('/seller/register')}
                    className="relative p-6 border border-white/30 bg-white/10 backdrop-blur-sm rounded-lg cursor-pointer hover:border-orange-500 hover:bg-white/20 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-orange-500/20 backdrop-blur-sm border border-orange-500/30">
                        <Store className="h-6 w-6 text-orange-400" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-white">I'm a Seller</h4>
                        <p className="text-sm text-white/80">Sell your construction materials</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-sm text-white/90">
                    Already have an account?{' '}
                    <button 
                      onClick={() => handleNavigation('/login')}
                      className="font-medium text-orange-500 hover:text-orange-400 hover:underline focus:outline-none"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};
