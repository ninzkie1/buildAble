import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

export const ProductCard = ({ product, onAddToCart, getOptimizedImageUrl }) => {
  return (
    <div className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
      <div className="relative h-64 bg-gray-100 overflow-hidden">
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
              In Stock: {product.stock}
            </span>
          )}
        </div>
      </div>

      <div className="p-3 flex flex-col justify-between">
        <div>
          <h3 className="text-sm md:text-base font-medium text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            ${product.price.toFixed(2)}
          </p>
        </div>

        <button
          onClick={() => onAddToCart(product)}
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
  );
};