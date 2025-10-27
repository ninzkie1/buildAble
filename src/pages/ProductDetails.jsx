import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext'; // Update this import
import toast from 'react-hot-toast';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart(); // Use useCart instead of useCartActions

  const getOptimizedImageUrl = (imageUrl, width = 600) => {
    if (!imageUrl) return "/placeholder.jpg";
    if (imageUrl.includes("res.cloudinary.com")) {
      const parts = imageUrl.split("/upload/");
      return `${parts[0]}/upload/w_${width},c_fill,q_auto,f_auto/${parts[1]}`;
    }
    return imageUrl;
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!response.ok) throw new Error('Failed to fetch product details');
        
        const data = await response.json();
        setProduct(data.product);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (!product.stock || product.stock <= 0) return;
    
    addToCart(product);
    toast.success(
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0 w-6 h-6">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover rounded"
          />
        </div>
        <p className="text-sm font-medium">Added to cart!</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B84937]"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">Error: {error || 'Product not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="relative aspect-square">
              <img
                src={getOptimizedImageUrl(product.imageUrl)}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = "/placeholder.jpg";
                  e.target.onerror = null;
                }}
              />
              {/* Stock Badge */}
              <div className="absolute top-4 right-4">
                {product.stock <= 0 ? (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Out of Stock
                  </span>
                ) : product.stock <= 5 ? (
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Low Stock: {product.stock}
                  </span>
                ) : (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    In Stock: {product.stock}
                  </span>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-xl font-semibold text-[#B84937] mb-4">
                ${product.price.toFixed(2)}
              </p>
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2>
                <p className="text-gray-600">{product.description}</p>
              </div>
              
              {/* Seller Information */}
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Seller</h2>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#B84937] rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {product.seller?.name?.charAt(0) || 'S'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.seller?.name || 'Unknown Seller'}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          size={16}
                          className={`${
                            index < (product.seller?.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">
                        ({product.seller?.rating || 0}/5)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition ${
                  product.stock <= 0
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-[#B84937] text-white hover:bg-[#9E3C2D]'
                }`}
              >
                <ShoppingCart size={20} />
                {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}