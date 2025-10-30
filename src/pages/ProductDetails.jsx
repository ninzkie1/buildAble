import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext'; // Update this import
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import config from '../config/config';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart(); // Use useCart instead of useCartActions
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState({ rating: 5, comment: '' });
  const [canReview, setCanReview] = useState(false);

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
        const response = await fetch(`${config.apiUrl}/api/products/${id}`);
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

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/api/products/${id}/reviews`);
        const data = await response.json();
        if (data.success) {
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();
  }, [id]);

  useEffect(() => {
    const checkCanReview = async () => {
      if (!user) {
        setCanReview(false);
        return;
      }

      try {
        const response = await fetch(
          `${config.apiUrl}/api/products/${id}/can-review`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        const data = await response.json();
        setCanReview(data.canReview);
      } catch (error) {
        console.error('Error checking review eligibility:', error);
        setCanReview(false);
      }
    };

    checkCanReview();
  }, [id, user]);

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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${config.apiUrl}/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(userReview)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Review submitted successfully!');
        // Refresh reviews
        const reviewsResponse = await fetch(`${config.apiUrl}/api/products/${id}/reviews`);
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData.reviews);
        setUserReview({ rating: 5, comment: '' });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        className={`${
          index < rating
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
                ₱{product.price.toFixed(2)}
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

        {/* Reviews Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            
            {/* Review Form */}
            {user ? (
              canReview ? (
                <form onSubmit={handleSubmitReview} className="mb-8 border-b pb-8">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserReview({ ...userReview, rating: star })}
                          className="focus:outline-none"
                        >
                          <Star
                            size={24}
                            className={`${
                              star <= userReview.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review
                    </label>
                    <textarea
                      value={userReview.comment}
                      onChange={(e) => setUserReview({ ...userReview, comment: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-[#B84937] focus:border-[#B84937]"
                      rows="4"
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="bg-[#B84937] text-white px-4 py-2 rounded-lg hover:bg-[#9E3C2D] transition"
                  >
                    Submit Review
                  </button>
                </form>
              ) : (
                <div className="mb-8 border-b pb-8">
                  <p className="text-gray-600">
                    You can only review products from completed orders. Purchase and receive this item to leave a review.
                  </p>
                </div>
              )
            ) : (
              <div className="mb-8 border-b pb-8">
                <p className="text-gray-600">
                  Please <Link to="/login" className="text-[#B84937] hover:underline">login</Link> to leave a review.
                </p>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review._id} className="border-b pb-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-8 h-8 bg-[#B84937] rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {review.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{review.name}</p>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          {review.verifiedPurchase && (
                            <span className="text-xs text-green-600 font-medium">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">No reviews yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}