import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Star, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

// Add this utility function at the top of the file
const getOptimizedImageUrl = (imageUrl, width = 400) => {
  if (!imageUrl) return "/placeholder.jpg";
  if (imageUrl.includes("res.cloudinary.com")) {
    const parts = imageUrl.split("/upload/");
    return `${parts[0]}/upload/w_${width},c_fill,q_auto,f_auto/${parts[1]}`;
  }
  return imageUrl;
};

export const UserHome = () => {
  // Add cart context
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8; // Show 8 products in a 2x4 grid

  const categories = [
    'All',
    'Concrete & Cement',
    'Steel & Metal',
    'Electrical',
    'Plumbing',
    'Lumber & Wood',
    'Paint & Coatings',
    'Roofing',
    'Flooring',
    'Hardware & Tools',
    'HVAC',
    'Safety Equipment',
    'Insulation',
    'Windows & Doors',
    'Landscaping',
    'Other'
  ];

  // Update the fetchProducts function in useEffect
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        const data = await response.json();
        
        // Map products to ensure all required fields are present
        const processedProducts = data.products.map(product => ({
          ...product,
          category: product.category || 'Other',
          numReviews: product.numReviews || 0,
          rating: product.rating || 0
        }));

        setProducts(processedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Replace the existing filteredProducts logic with this:
  const filteredProducts = products.filter(product => {
    // First filter by category
    if (selectedCategory !== 'All' && product.category !== selectedCategory) {
      return false;
    }
    
    // Then filter by search if there's a search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Sort the filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  // Add handleAddToCart function
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

  // Pagination calculation
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of the products grid
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update the handleCategoryChange function
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    
    const filtered = products.filter(p => category === 'All' || p.category === category);
    console.log('Selected category:', category);
    console.log('Filtered products:', filtered);

    toast(
      <div className="flex items-center gap-2">
        <span className="text-[#B84937]">🔍</span>
        <span>Showing {category} products ({filtered.length})</span>
      </div>,
      {
        duration: 2000,
        className: 'bg-white border-l-4 border-[#B84937]'
      }
    );
  };

  // Add this debug useEffect
  useEffect(() => {
    if (products.length > 0) {
      console.log('All products:', products);
      console.log('Products with categories:', products.map(p => ({
        name: p.name,
        category: p.category
      })));
    }
  }, [products]);

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Search and Filter Header */}
      <div className="sticky top-0 z-10 bg-white shadow-md w-full">
        <div className="w-full px-4 py-4 max-w-[2000px] mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#B84937] focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Categories - Updated for better mobile scrolling */}
          {showFilters && (
            <div className="mt-4 -mx-4 px-4 py-2 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 min-w-max pb-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-[#B84937] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } transition`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 py-8 max-w-[2000px] mx-auto">
        {/* Recommendations Section - Always visible */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Recommended for You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
            {products
              .filter(product => product.rating >= 4)
              .slice(0, 5)
              .map(product => (
                <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden h-full flex flex-col">
                  <div className="relative h-48 sm:h-56 bg-gray-100">
                    <Link to={`/product/${product._id}`}>
                      <img
                        src={getOptimizedImageUrl(product.imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                    </Link>
                    <div className="absolute top-2 right-2 flex justify-end w-full px-2">
                      {product.stock <= 0 ? (
                          <span className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap">
                          Out of Stock
                          </span>
                      ) : product.stock <= 5 ? (
                          <span className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap">
                          Low Stock: {product.stock}
                          </span>
                      ) : (
                          <span className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap">
                          In Stock: {product.stock}
                          </span>
                      )}
                      </div>

                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <Link to={`/product/${product._id}`} className="flex-grow">
                      <h3 className="text-lg font-medium text-gray-900 hover:text-[#B84937] transition line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="mt-1 text-gray-600">${product.price.toFixed(2)}</p>
                    {/* Add category display */}
                    <div className="mt-1 mb-2">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-sm text-gray-600 rounded-full">
                        {product.category}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          size={16}
                          className={index < (product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      className={`mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition ${
                        product.stock <= 0
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-[#B84937] text-white hover:bg-[#9E3C2D]"
                      }`}
                    >
                      <ShoppingCart size={18} />
                      {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* All Products Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">All Products</h2>
            <div className="text-sm text-gray-600">
              Showing {currentProducts.length} of {filteredProducts.length} products
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B84937]"></div>
              </div>
            ) : currentProducts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              currentProducts.map(product => (
                <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden h-full flex flex-col">
                  {/* Copy the same structure from above */}
                  <div className="relative h-48 sm:h-56 bg-gray-100">
                    <Link to={`/product/${product._id}`}>
                      <img
                        src={getOptimizedImageUrl(product.imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                    </Link>
                    <div className="absolute top-2 right-2">
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
                          In Stock
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <Link to={`/product/${product._id}`} className="flex-grow">
                      <h3 className="text-lg font-medium text-gray-900 hover:text-[#B84937] transition line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="mt-1 text-gray-600">${product.price.toFixed(2)}</p>
                    {/* Add category display */}
                    <div className="mt-1 mb-2">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-sm text-gray-600 rounded-full">
                        {product.category}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          size={16}
                          className={index < (product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-1">
                        ({product.numReviews || 0} reviews)
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      className={`mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition ${
                        product.stock <= 0
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-[#B84937] text-white hover:bg-[#9E3C2D]"
                      }`}
                    >
                      <ShoppingCart size={18} />
                      {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-4 py-2 rounded-lg transition ${
                      currentPage === index + 1
                        ? 'bg-[#B84937] text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHome;