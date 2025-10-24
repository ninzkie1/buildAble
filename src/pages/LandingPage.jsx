import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

export const LandingPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);

  const { addToCart } = useCart(); // ✅ Access addToCart

  const categories = [
    "All",
    "Power Tools",
    "Hand Tools",
    "Measuring",
    "Safety Equipment",
    "Fasteners",
    "Storage",
  ];

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
        // Check if data has the expected structure
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

  const PaginationControls = () => {
    const totalPages = Math.ceil(products.length / productsPerPage);
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div className="flex items-center justify-center gap-2 my-8">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeft size={20} />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              currentPage === page
                ? "bg-[#B84937] text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  };

  // Update the pagination calculation
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = Array.isArray(products)
    ? products.slice(indexOfFirstProduct, indexOfLastProduct)
    : [];

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

  // Update the handleAddToCart function
  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      toast.error('This product is out of stock', {
        icon: '❌',
        style: {
          minWidth: '250px',
        },
      });
      return;
    }

    try {
      addToCart(product);
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-bounce' : ''
          } bg-white shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4 border-l-4 border-[#B84937]`}
        >
          <div className="flex-shrink-0 w-12 h-12 overflow-hidden rounded">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              Added to cart!
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {product.name}
            </p>
          </div>
        </div>
      ), {
        duration: 2000,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart', {
        icon: '❌',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Categories Navigation */}
      <nav className="bg-white border-b overflow-x-auto">
        <div className="max-w-full mx-auto px-4">
          <ul className="flex items-center gap-8 py-4 whitespace-nowrap">
            {categories.map((category, index) => (
              <li key={index} className="flex-shrink-0">
                <Link
                  to={`/category/${category.toLowerCase()}`}
                  className="text-gray-600 hover:text-[#B84937] transition text-sm md:text-base"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
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
            <Link
              to="/shop"
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
            </Link>
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

      {/* Products Section */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-12 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-0">
            All Products
          </h2>
          <span className="text-gray-500 text-sm md:text-base">
            {products.length} products
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {currentProducts.map((product) => (
            <div
              key={product._id}
              className="group relative flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <Link to={`/product/${product._id}`}>
                  <img
                    src={getOptimizedImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "/placeholder.jpg";
                      e.target.onerror = null;
                    }}
                  />
                </Link>

                {/* Add stock badge */}
                <div className="absolute top-2 right-2 z-10">
                  {product.stock <= 0 ? (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                      Out of Stock
                    </span>
                  ) : product.stock <= 5 ? (
                    <span className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                      Low Stock: {product.stock}
                    </span>
                  ) : (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                      In Stock: {product.stock}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="text-sm md:text-base font-medium text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    ${product.price.toFixed(2)}
                  </p>
                </div>

                {/* Update Add to Cart button to handle out of stock */}
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock <= 0}
                  className={`mt-3 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition ${
                    product.stock <= 0
                      ? "bg-gray-300 cursor-not-allowed text-gray-500"
                      : "bg-[#B84937] text-white hover:bg-[#9E3C2D]"
                  }`}
                >
                  <ShoppingCart size={16} />
                  {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <PaginationControls />
      </section>
      {/* About Us Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">About Us</h2>
            <div className="w-24 h-1 bg-[#B84937] mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900">
                Welcome to buildABLE
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Your go-to website for finding construction materials with ease and
                convenience.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We understand how time-consuming and tiring it can be to visit
                multiple stores just to compare prices, availability, and quality of
                materials. That's why we created a platform designed to simplify the
                entire canvassing process.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our goal is to help homeowners, builders, and contractors easily find
                what they need — providing quick, accurate, and straightforward
                information all in one place. With just a few clicks, you can save
                time, compare options, and make smarter purchasing decisions for your
                construction projects.
              </p>
              <p className="text-gray-600 leading-relaxed font-medium">
                At buildABLE, we make construction material canvassing faster, easier,
                and more accessible for everyone. Surely, it is CLICKABLE with
                buildABLE.
              </p>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-lg overflow-hidden shadow-xl">
                <img
                  src="/storeImg.jpg" // Add an about image to your public folder
                  alt="Construction site"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-[#B84937]/10 rounded-lg -z-10"></div>
              <div className="absolute -top-6 -right-6 w-48 h-48 bg-[#B84937]/10 rounded-lg -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
