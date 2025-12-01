import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Search,
  Send,
  XCircle,
  Loader2,
  CheckCircle,
  ArrowLeftRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import config from '../../config/config';

export default function ApprovedWithdrawals() {
  const navigate = useNavigate();
  const { user: currentAdmin } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (currentAdmin && currentAdmin.role !== 'admin') {
      toast.error('Access denied. Admin role required.');
      navigate('/');
      return;
    }
    fetchApprovedRequests();
  }, [currentAdmin, navigate]);

  const fetchApprovedRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/api/users/admin/withdrawals/approved`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch approved withdrawals');
      }

      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching approved withdrawals:', error);
      toast.error(error.message || 'Failed to load approved withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (request, status) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${config.apiUrl}/api/users/admin/sellers/${request.sellerId}/withdrawals/${request.requestId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status
          })
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update withdrawal');
      }

      toast.success(`Withdrawal ${status} successfully`);
      fetchApprovedRequests();
    } catch (error) {
      console.error('Error updating withdrawal:', error);
      toast.error(error.message || 'Failed to update withdrawal');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const q = search.toLowerCase();
    return (
      request.sellerName.toLowerCase().includes(q) ||
      (request.sellerEmail || '').toLowerCase().includes(q) ||
      (request.paymentMethod || '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4 text-gray-600">
          <Loader2 className="h-10 w-10 animate-spin" />
          <p>Loading approved withdrawals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Approved Withdrawals</h1>
            <p className="text-gray-600 mt-1">
              Review all withdrawal requests that have been approved and are ready to be paid out.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/withdrawals/history')}
            className="px-4 py-2 rounded-lg border border-purple-200 text-purple-600 bg-purple-50 hover:bg-purple-100 transition flex items-center gap-2"
          >
            <ArrowLeftRight size={18} />
            View Full History
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Wallet className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Approved Requests</p>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            </div>
          </div>

          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by seller name, email, or payment method..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No approved withdrawals found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.requestId}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Seller</p>
                    <p className="font-semibold text-gray-900">{request.sellerName}</p>
                    <p className="text-sm text-gray-500">{request.sellerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="text-xl font-bold text-gray-900">₱{request.amount?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium capitalize">{request.paymentMethod?.replace('_', ' ')}</p>
                    <p className="text-sm text-gray-500 break-words">{request.paymentDetails || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Requested</p>
                    <p className="font-medium text-gray-900">
                      {new Date(request.requestedAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Available Balance: ₱{request.availableBalance?.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleProcess(request, 'completed')}
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      <Send size={18} />
                      Mark Paid
                    </button>
                    <button
                      onClick={() => handleProcess(request, 'rejected')}
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                    <button
                      onClick={() => handleProcess(request, 'approved')}
                      disabled
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-green-200 text-green-600 bg-green-50"
                    >
                      <CheckCircle size={18} />
                      Approved
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

