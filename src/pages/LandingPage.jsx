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
        const response = await fetch("http://localhost:5000/api/products");
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
    <div className="min-h-screen w-full bg-white flex flex-col">
      {/* Hero Section - Full Width */}
      <div className="full-width-section bg-gradient-to-r from-[#B84937] to-[#7A2B22]">
        <HeroSection />
      </div>

      {/* Products Section - Full Width with contained content */}
      <div className="full-width-section py-12">
        <div className="content-wrapper">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">All Products</h2>
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
      <div className="full-width-section bg-gray-50 py-12">
        <div className="content-wrapper">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose BuildAble</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#B84937] rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Quality Tools</h3>
              <p className="text-gray-600">Top-grade construction tools and equipment for professionals</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#B84937] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Expert Support</h3>
              <p className="text-gray-600">Dedicated team to help with your construction needs</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#B84937] rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Service</h3>
              <p className="text-gray-600">Round-the-clock customer support and assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section - Full Width */}
      <div ref={aboutRef} className="full-width-section py-12">
        <div className="content-wrapper">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2">
                <img
                  src="/storeImg.jpg"
                  alt="About BuildAble"
                  className="w-full h-full object-cover"
                  style={{ minHeight: '400px' }}
                />
              </div>
              <div className="md:w-1/2 p-8">
                <h2 className="text-2xl font-bold mb-4">About BuildAble</h2>
                <p className="text-gray-600 mb-4">
                  At BuildAble, we're committed to providing high-quality construction tools
                  and equipment to professionals and DIY enthusiasts alike. With years of
                  experience in the industry, we understand the importance of reliable tools
                  for successful projects.
                </p>
                <p className="text-gray-600 mb-6">
                  Our extensive collection includes power tools, hand tools, safety equipment,
                  and more. We pride ourselves on offering competitive prices and exceptional
                  customer service.
                </p>
                <Link
                  to="/about"
                  className="inline-flex items-center text-[#B84937] hover:text-[#9E3C2D] font-medium"
                >
                  Learn More About Us
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section - Full Width */}
      <div className="full-width-section bg-gray-50 py-12">
        <div className="content-wrapper">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Get in Touch</h2>
            <p className="text-gray-600">Have questions? We're here to help!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <Phone className="h-8 w-8 text-[#B84937] mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Call Us</h3>
              <p className="text-gray-600">+1 (234) 567-8900</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <Mail className="h-8 w-8 text-[#B84937] mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Email Us</h3>
              <p className="text-gray-600">contact@buildable.com</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <MapPin className="h-8 w-8 text-[#B84937] mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-600">123 Builder Street, Construction City, CC 12345</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Full Width */}
      <div className="full-width-section">
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
