import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  Store, 
  Search, 
  Eye, 
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  X,
  Wallet,
  ArrowLeftRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import config from '../../config/config';

export default function AdminSellers() {
  const navigate = useNavigate();
  const { user: currentAdmin } = useContext(AuthContext);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [sellerSales, setSellerSales] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const sellersPerPage = 5;
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  // Check if user is admin
  useEffect(() => {
    if (currentAdmin && currentAdmin.role !== 'admin') {
      toast.error('Access denied. Admin role required.');
      navigate('/');
    }
  }, [currentAdmin, navigate]);

  // Fetch all sellers
  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${config.apiUrl}/api/users/admin/sellers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sellers');
      }

      const data = await response.json();
      setSellers(data);
    } catch (error) {
      console.error('Error fetching sellers:', error);
      toast.error('Failed to load sellers');
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerSales = async (sellerId) => {
    try {
      setSalesLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${config.apiUrl}/api/users/admin/sellers/${sellerId}/sales`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch seller sales');
      }

      const data = await response.json();
      setSellerSales(data.orders || []);
    } catch (error) {
      console.error('Error fetching seller sales:', error);
      toast.error('Failed to load seller sales');
    } finally {
      setSalesLoading(false);
    }
  };

  const handleViewSales = async (seller) => {
    setSelectedSeller(seller);
    await fetchSellerSales(seller._id);
    setShowSalesModal(true);
  };

  const handleProcessWithdrawal = async (seller, requestId, status) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${config.apiUrl}/api/users/admin/sellers/${seller._id}/withdrawals/${requestId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status,
            adminNotes: adminNotes || undefined
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process withdrawal');
      }

      toast.success(`Withdrawal ${status} successfully`);
      setShowWithdrawalModal(false);
      setAdminNotes('');
      fetchSellers();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast.error(error.message || 'Failed to process withdrawal');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter sellers
  const filteredSellers = sellers.filter((seller) => {
    const matchesSearch = 
      seller.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredSellers.length / sellersPerPage);
  const indexOfLastSeller = currentPage * sellersPerPage;
  const indexOfFirstSeller = indexOfLastSeller - sellersPerPage;
  const currentSellers = filteredSellers.slice(indexOfFirstSeller, indexOfLastSeller);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B84937]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Store className="text-[#B84937]" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Seller Management</h1>
                <p className="text-gray-600 mt-1">Manage sellers, view sales, and process withdrawals</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/admin/withdrawals/approved')}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow"
              >
                <Wallet size={18} />
                Approved Withdrawals
              </button>
              <button
                onClick={() => navigate('/admin/withdrawals/history')}
                className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow"
              >
                <ArrowLeftRight size={18} />
                Withdrawal History
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search sellers by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B84937] focus:border-transparent"
            />
          </div>
        </div>

        {/* Sellers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {currentSellers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Store className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-500">No sellers found</p>
            </div>
          ) : (
            currentSellers.map((seller) => (
              <div key={seller._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B84937] to-[#9E3C2D] flex items-center justify-center text-white font-bold text-lg">
                      {seller.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{seller.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail size={14} />
                        {seller.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm text-gray-600">Total Revenue</span>
                    <span className="font-bold text-green-600">₱{seller.totalRevenue?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="text-sm text-gray-600">Available Balance</span>
                    <span className="font-bold text-blue-600">₱{seller.availableBalance?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span className="text-sm text-gray-600">Pending Earnings</span>
                    <span className="font-bold text-yellow-600">₱{seller.pendingEarnings?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Total Sales</span>
                    <span className="font-bold text-gray-900">{seller.totalSales || 0} items</span>
                  </div>
                </div>

                {/* Withdrawal Requests Badge */}
                {seller.pendingWithdrawalsCount > 0 && (
                  <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-700 font-medium">
                        {seller.pendingWithdrawalsCount} Pending Withdrawal{seller.pendingWithdrawalsCount > 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedSeller(seller);
                          setShowWithdrawalModal(true);
                        }}
                        className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        View
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleViewSales(seller)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#B84937] text-white rounded-lg hover:bg-[#9E3C2D] transition"
                  >
                    <Eye size={18} />
                    View Sales
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-4 py-2 rounded-lg transition font-medium ${
                          currentPage === pageNumber
                            ? 'bg-[#B84937] text-white'
                            : 'border border-gray-300 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <span key={pageNumber} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next Page"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            
            <div className="mt-4 text-center text-sm text-gray-600">
              Showing {indexOfFirstSeller + 1}-{Math.min(indexOfLastSeller, filteredSellers.length)} of {filteredSellers.length} sellers
            </div>
          </div>
        )}

        {/* Sales Modal */}
        {showSalesModal && selectedSeller && (
          <SalesModal
            seller={selectedSeller}
            sales={sellerSales}
            loading={salesLoading}
            onClose={() => {
              setShowSalesModal(false);
              setSelectedSeller(null);
              setSellerSales([]);
            }}
          />
        )}

        {/* Withdrawal Modal */}
        {showWithdrawalModal && selectedSeller && (
          <WithdrawalModal
            seller={selectedSeller}
            adminNotes={adminNotes}
            setAdminNotes={setAdminNotes}
            onProcess={handleProcessWithdrawal}
            onClose={() => {
              setShowWithdrawalModal(false);
              setSelectedSeller(null);
              setAdminNotes('');
            }}
            loading={actionLoading}
          />
        )}
      </div>
    </div>
  );
}

// Sales Modal Component
function SalesModal({ seller, sales, loading, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sales for {seller.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{sales.length} orders</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B84937]"></div>
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-500">No delivered sales found</p>
              <p className="text-sm text-gray-400 mt-2">Only delivered orders with successful payment are shown</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sales.map((order) => (
                <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">Order #{order._id.slice(-8)}</p>
                      <p className="text-sm text-gray-600">Customer: {order.user?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-600">{order.user?.email || ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#B84937]">₱{order.totalAmount.toFixed(2)}</p>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.product?.name || 'Product'}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity} × ₱{item.price.toFixed(2)}</p>
                        </div>
                        <p className="font-semibold text-gray-900">₱{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <span>Payment: {order.paymentMethod}</span>
                      <span>Status: {order.paymentStatus}</span>
                    </div>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Withdrawal Modal Component
function WithdrawalModal({ seller, adminNotes, setAdminNotes, onProcess, onClose, loading }) {
  const pendingRequests = seller.withdrawalRequests?.filter(w => w.status === 'pending') || [];
  const allRequests = seller.withdrawalRequests || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Withdrawal Requests - {seller.name}</h2>
            <p className="text-sm text-gray-600 mt-1">Available Balance: ₱{seller.availableBalance?.toFixed(2) || '0.00'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {pendingRequests.length === 0 && allRequests.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-500">No withdrawal requests</p>
            </div>
          ) : (
            <>
              {/* Pending Requests */}
              {pendingRequests.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Pending Requests</h3>
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <div key={request._id} className="border border-yellow-300 bg-yellow-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-bold text-gray-900">₱{request.amount.toFixed(2)}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Payment Method: {request.paymentMethod?.replace('_', ' ').toUpperCase()}
                            </p>
                            {request.paymentDetails && (
                              <p className="text-sm text-gray-600">Details: {request.paymentDetails}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Requested: {new Date(request.requestedAt).toLocaleString()}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-medium">
                            Pending
                          </span>
                        </div>

                        <textarea
                          placeholder="Add admin notes (optional)"
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B84937] focus:border-transparent mb-3"
                          rows="2"
                        />

                        <div className="flex gap-2">
                          <button
                            onClick={() => onProcess(seller, request._id, 'approved')}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                          >
                            <CheckCircle size={18} />
                            Approve
                          </button>
                          <button
                            onClick={() => onProcess(seller, request._id, 'rejected')}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                          >
                            <XCircle size={18} />
                            Reject
                          </button>
                          <button
                            onClick={() => onProcess(seller, request._id, 'completed')}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                          >
                            <Send size={18} />
                            Mark Paid
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Requests History */}
              {allRequests.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Request History</h3>
                  <div className="space-y-2">
                    {allRequests.map((request) => (
                      <div key={request._id} className={`border rounded-lg p-3 ${
                        request.status === 'completed' ? 'border-green-300 bg-green-50' :
                        request.status === 'rejected' ? 'border-red-300 bg-red-50' :
                        request.status === 'approved' ? 'border-blue-300 bg-blue-50' :
                        'border-yellow-300 bg-yellow-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">₱{request.amount.toFixed(2)}</p>
                            <p className="text-xs text-gray-600">
                              {request.paymentMethod?.replace('_', ' ').toUpperCase()}
                              {request.processedAt && ` • Processed: ${new Date(request.processedAt).toLocaleDateString()}`}
                            </p>
                            {request.adminNotes && (
                              <p className="text-xs text-gray-700 mt-1 italic">Note: {request.adminNotes}</p>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            request.status === 'completed' ? 'bg-green-200 text-green-800' :
                            request.status === 'rejected' ? 'bg-red-200 text-red-800' :
                            request.status === 'approved' ? 'bg-blue-200 text-blue-800' :
                            'bg-yellow-200 text-yellow-800'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

