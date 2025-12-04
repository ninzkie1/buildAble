import React, { useState, useEffect } from 'react';
import { CreditCard, Wallet } from 'lucide-react';

export default function PaymentMethodModal({ isOpen, onClose, onConfirm, totalAmount, subtotal, transactionFee, loading }) {
  const [selectedMethod, setSelectedMethod] = useState('online');

  // Reset to default when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMethod('online');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm(selectedMethod);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold mb-2">Select Payment Method</h2>
        <p className="text-gray-600 mb-6">Choose how you would like to pay for your order</p>
        
        <div className="space-y-3 mb-6">
          <label
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedMethod === 'online'
                ? 'border-[#B84937] bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="online"
              checked={selectedMethod === 'online'}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="sr-only"
            />
            <div className="flex items-center gap-4 flex-1">
              <div className={`p-3 rounded-full ${
                selectedMethod === 'online' ? 'bg-[#B84937]' : 'bg-gray-200'
              }`}>
                <CreditCard 
                  size={24} 
                  className={selectedMethod === 'online' ? 'text-white' : 'text-gray-600'} 
                />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Pay Online</div>
                <div className="text-sm text-gray-600">Secure payment via PayMongo</div>
              </div>
              {selectedMethod === 'online' && (
                <div className="text-[#B84937] font-semibold">
                  ₱{totalAmount.toFixed(2)}
                </div>
              )}
            </div>
          </label>

          <label
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedMethod === 'cod'
                ? 'border-[#B84937] bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={selectedMethod === 'cod'}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="sr-only"
            />
            <div className="flex items-center gap-4 flex-1">
              <div className={`p-3 rounded-full ${
                selectedMethod === 'cod' ? 'bg-[#B84937]' : 'bg-gray-200'
              }`}>
                <Wallet 
                  size={24} 
                  className={selectedMethod === 'cod' ? 'text-white' : 'text-gray-600'} 
                />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Cash on Delivery</div>
                <div className="text-sm text-gray-600">Pay when you receive your order</div>
              </div>
              {selectedMethod === 'cod' && (
                <div className="text-[#B84937] font-semibold">
                  ₱{totalAmount.toFixed(2)}
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Price Breakdown */}
        <div className="border-t pt-4 mb-4 space-y-2">
          {subtotal !== undefined && transactionFee !== undefined && (
            <>
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Subtotal:</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Transaction Fee (2%):</span>
                <span>₱{transactionFee.toFixed(2)}</span>
              </div>
            </>
          )}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-xl font-bold text-[#B84937]">₱{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-gray-600 hover:text-gray-800 font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`px-5 py-2 rounded-lg text-white font-medium transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#B84937] hover:bg-[#9E3C2D]'
            }`}
          >
            {loading ? 'Processing...' : selectedMethod === 'cod' ? 'Place Order' : 'Proceed to Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

