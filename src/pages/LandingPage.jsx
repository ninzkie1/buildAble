import React, { useState, useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import { 
  ChevronLeft, 
  ChevronRight,
  ShoppingBag,
  Wrench, 
  Users,
  Phone,
  Mail, 
  MapPin 
} from "lucide-react";
import { Link } from "react-router-dom"; 
import toast from "react-hot-toast";
import { HeroSection } from "../components/HeroSection";
import { ProductCard } from "../components/ProductCard";
import Footer from "../components/Footer";
import config from "../config/config";

export const LandingPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const aboutRef = useRef(null);

  const getOptimizedImageUrl = (imageUrl, width = 400) => {
    if (!imageUrl) return "/placeholder.jpg";
    if (imageUrl.includes("res.cloudinary.com")) {
      const parts = imageUrl.split("/upload/");
      return `${parts[0]}/upload/w_${width},c_fill,q_auto,f_auto/${parts[1]}`;
    }
    return imageUrl;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/api/products`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();

        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          throw new Error("Invalid products data format");
        }
      } catch (err) {
        setError(err.message);
        console.error("Products fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      toast.error('This product is out of stock');
      return;
    }

    try {
      addToCart(product);
      toast.success(`Added ${product.name} to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B84937]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col -mt-24">
      {/* Hero Section - Full Width - Overlaps navbar border by 1px */}
      <div className="full-width-section bg-gradient-to-r from-[#B84937] to-[#7A2B22]" style={{ marginTop: 'calc(80px - 1px)', paddingTop: 0 }}>
        <HeroSection />
      </div>

      {/* Products Section - Full Width with contained content */}
      <div className="full-width-section py-12 sm:py-16 md:py-20">
        <div className="content-wrapper">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-gray-900">All Products</h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">Discover our wide range of professional construction tools and equipment</p>
          </div>
          <div className="product-wrapper">
            <div
              id="productCarousel"
              className="product-slider"
            >
              {/* First set of products */}
              {products.map((product) => (
                <ProductCard
                  key={`first-${product._id}`}
                  product={product}
                  onAddToCart={handleAddToCart}
                  getOptimizedImageUrl={getOptimizedImageUrl}
                />
              ))}
              {/* Duplicate set for seamless loop */}
              {products.map((product) => (
                <ProductCard
                  key={`second-${product._id}`}
                  product={product}
                  onAddToCart={handleAddToCart}
                  getOptimizedImageUrl={getOptimizedImageUrl}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Full Width */}
      <div className="full-width-section bg-gray-50 py-12 sm:py-16 md:py-20">
        <div className="content-wrapper">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">Why Choose BuildAble</h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">Your trusted partner for quality construction tools and exceptional service</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            <div className="text-center p-6 sm:p-8 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#B84937] to-[#9E3C2D] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <Wrench className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900">Quality Tools</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">Top-grade construction tools and equipment for professionals</p>
            </div>

            <div className="text-center p-6 sm:p-8 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#B84937] to-[#9E3C2D] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <Users className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900">Expert Support</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">Dedicated team to help with your construction needs</p>
            </div>

            <div className="text-center p-6 sm:p-8 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#B84937] to-[#9E3C2D] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <Phone className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900">24/7 Service</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">Round-the-clock customer support and assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section - Full Width */}
      <div ref={aboutRef} className="full-width-section py-12 sm:py-16 md:py-20">
        <div className="content-wrapper">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/2 relative min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
                <img
                  src="/storeImg.jpg"
                  alt="About BuildAble"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="lg:w-1/2 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-gray-900">About BuildAble</h2>
                <p className="text-gray-600 mb-4 sm:mb-5 text-sm sm:text-base leading-relaxed">
                  At BuildAble, we're committed to providing high-quality construction tools
                  and equipment to professionals and DIY enthusiasts alike. With years of
                  experience in the industry, we understand the importance of reliable tools
                  for successful projects.
                </p>
                <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
                  Our extensive collection includes power tools, hand tools, safety equipment,
                  and more. We pride ourselves on offering competitive prices and exceptional
                  customer service.
                </p>
                <Link
                  to="/about"
                  className="inline-flex items-center text-[#B84937] hover:text-[#9E3C2D] font-semibold transition-colors duration-200 text-sm sm:text-base group"
                >
                  Learn More About Us
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section - Full Width */}
      <div className="full-width-section bg-gray-50 py-12 sm:py-16 md:py-20">
        <div className="content-wrapper">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-gray-900">Get in Touch</h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">Have questions? We're here to help!</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-6 sm:p-8 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-[#B84937]/20">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#B84937] to-[#9E3C2D] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Phone className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 sm:mb-3 text-gray-900 text-lg sm:text-xl">Call Us</h3>
              <p className="text-gray-600 text-sm sm:text-base">+1 (234) 567-8900</p>
            </div>

            <div className="text-center p-6 sm:p-8 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-[#B84937]/20">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#B84937] to-[#9E3C2D] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Mail className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 sm:mb-3 text-gray-900 text-lg sm:text-xl">Email Us</h3>
              <p className="text-gray-600 text-sm sm:text-base break-words">contact@buildable.com</p>
            </div>

            <div className="text-center p-6 sm:p-8 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-[#B84937]/20 sm:col-span-2 lg:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#B84937] to-[#9E3C2D] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <MapPin className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 sm:mb-3 text-gray-900 text-lg sm:text-xl">Visit Us</h3>
              <p className="text-gray-600 text-sm sm:text-base">123 Builder Street, Construction City, CC 12345</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Full Width - Removes container bottom padding */}
      <div className="full-width-section -mb-8">
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
