import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";


export const LandingPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);

    const { addToCart } = useCart();  // ✅ Access addToCart

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
        setProducts(data);
      } catch (err) {
        setError(err.message);
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

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

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

                {/* ✅ Add to Cart Button */}
                <button
                  onClick={() => addToCart(product)}
                  className="mt-3 flex items-center justify-center gap-2 bg-[#B84937] text-white py-2 rounded-lg font-medium hover:bg-[#9E3C2D] transition"
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <PaginationControls />
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
