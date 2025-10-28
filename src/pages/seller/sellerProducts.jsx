import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Star, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
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

const ITEMS_PER_PAGE = 9;

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchSellerProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/products/seller/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products');
      }

      setProducts(data.products);
      // Remove the success toast from here
    } catch (err) {
      toast.error(
        <div className="flex items-center gap-2">
          <span className="text-red-500">❌</span>
          <span>{err.message}</span>
        </div>
      );
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show toast only after initial data fetch is complete
  useEffect(() => {
    if (!loading && products.length > 0 && !error) {
      toast.success(
        <div className="flex flex-col">
          <span className="font-medium">Products loaded successfully!</span>
          <span className="text-sm text-gray-500">{products.length} products found</span>
        </div>
      );
    }
  }, [loading]);

  useEffect(() => {
    fetchSellerProducts();
  }, []);

  const handleDelete = async (productId) => {
    // Show loading toast
    const loadingToastId = toast.loading('Deleting product...');

    try {
      if (!window.confirm('Are you sure you want to delete this product?')) {
        toast.dismiss(loadingToastId);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete product');
      }

      setProducts(products.filter(product => product._id !== productId));
      
      // Update loading toast to success
      toast.success(
        <div className="flex items-center gap-2">
          <span className="text-green-500">✓</span>
          <span>Product deleted successfully</span>
        </div>,
        { id: loadingToastId }
      );
    } catch (err) {
      // Update loading toast to error
      toast.error(
        <div className="flex items-center gap-2">
          <span className="text-red-500">❌</span>
          <span>{err.message}</span>
        </div>,
        { id: loadingToastId }
      );
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
    
    toast(
      <div className="flex items-center gap-2">
        <span className="text-[#B84937]">🔍</span>
        <span>Showing {category} products</span>
      </div>,
      {
        icon: '🔍',
        duration: 2000,
        className: 'bg-white border-l-4 border-[#B84937]'
      }
    );
  };

  // Filter products by category
  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(product => product.category === selectedCategory);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Render star rating
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        className={`${
          index < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
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
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
          <Link
            to="/seller/products/new"
            className="flex items-center gap-2 bg-[#B84937] text-white px-4 py-2 rounded-lg hover:bg-[#9E3C2D] transition"
          >
            <PlusCircle size={20} />
            <span>Add Product</span>
          </Link>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-600 mb-4"
          >
            <Filter size={20} />
            <span>Filter by Category</span>
          </button>
          
          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    selectedCategory === category
                      ? 'bg-[#B84937] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } transition`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {paginatedProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No products found</p>
            <Link
              to="/seller/products/new"
              className="text-[#B84937] hover:underline"
            >
              Add your first product
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                    <p className="text-gray-600 mb-2">{product.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(product.rating || 0)}
                      <span className="text-sm text-gray-500">
                        ({product.numReviews || 0} reviews)
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-bold text-[#B84937]">
                        ${product.price}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        product.stock > 0 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mb-4">
                      Category: {product.category || 'Uncategorized'}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/seller/products/edit/${product._id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                      >
                        <Edit size={20} />
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center gap-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-4 py-2 rounded ${
                    currentPage === index + 1
                      ? 'bg-[#B84937] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } transition`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}