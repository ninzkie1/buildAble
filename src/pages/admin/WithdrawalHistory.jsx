import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Search,
  Send,
  XCircle,
  CheckCircle,
  Loader2,
  ArrowLeftRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import config from '../../config/config';

const STATUS_OPTIONS = ['all', 'pending', 'approved', 'completed', 'rejected'];

export default function WithdrawalHistory() {
  const navigate = useNavigate();
  const { user: currentAdmin } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (currentAdmin && currentAdmin.role !== 'admin') {
      toast.error('Access denied. Admin role required.');
      navigate('/');
      return;
    }
    fetchHistory();
  }, [currentAdmin, navigate]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/api/users/admin/withdrawals/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch withdrawal history');
      }

      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
      toast.error(error.message || 'Failed to load withdrawal history');
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
          body: JSON.stringify({ status })
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update withdrawal');
      }

      toast.success(`Withdrawal ${status} successfully`);
      fetchHistory();
    } catch (error) {
      console.error('Error updating withdrawal:', error);
      toast.error(error.message || 'Failed to update withdrawal');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const q = search.toLowerCase();
    const matchesSearch =
      request.sellerName.toLowerCase().includes(q) ||
      (request.sellerEmail || '').toLowerCase().includes(q) ||
      (request.paymentMethod || '').toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'all' ? true : request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const renderStatusBadge = (status) => {
    const base = 'px-3 py-1 rounded-full text-xs font-semibold';
    switch (status) {
      case 'pending':
        return <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending</span>;
      case 'approved':
        return <span className={`${base} bg-blue-100 text-blue-700`}>Approved</span>;
      case 'completed':
        return <span className={`${base} bg-green-100 text-green-700`}>Completed</span>;
      case 'rejected':
        return <span className={`${base} bg-red-100 text-red-700`}>Rejected</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-600`}>{status}</span>;
    }
  };

  const renderActions = (request) => {
    const baseButton =
      'flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition disabled:opacity-50';

    switch (request.status) {
      case 'pending':
        return (
          <>
            <button
              onClick={() => handleProcess(request, 'approved')}
              disabled={actionLoading}
              className={`${baseButton} bg-blue-600 text-white hover:bg-blue-700`}
            >
              <CheckCircle size={18} />
              Approve
            </button>
            <button
              onClick={() => handleProcess(request, 'rejected')}
              disabled={actionLoading}
              className={`${baseButton} bg-red-600 text-white hover:bg-red-700`}
            >
              <XCircle size={18} />
              Reject
            </button>
          </>
        );
      case 'approved':
        return (
          <>
            <button
              onClick={() => handleProcess(request, 'completed')}
              disabled={actionLoading}
              className={`${baseButton} bg-blue-600 text-white hover:bg-blue-700`}
            >
              <Send size={18} />
              Mark Paid
            </button>
            <button
              onClick={() => handleProcess(request, 'rejected')}
              disabled={actionLoading}
              className={`${baseButton} bg-red-600 text-white hover:bg-red-700`}
            >
              <XCircle size={18} />
              Reject
            </button>
          </>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 border border-green-200">
            <CheckCircle size={18} />
            Paid
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200">
            <XCircle size={18} />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4 text-gray-600">
          <Loader2 className="h-10 w-10 animate-spin" />
          <p>Loading withdrawal history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ArrowLeftRight className="text-[#B84937]" />
              Withdrawal History
            </h1>
            <p className="text-gray-600 mt-1">
              View all withdrawal requests from every seller across all statuses.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/admin/withdrawals/approved')}
              className="px-4 py-2 rounded-lg border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
            >
              Approved Only
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Wallet className="text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by seller name, email, or payment method..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No withdrawal requests found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.requestId}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-4"
              >
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  {renderStatusBadge(request.status)}
                  <span className="text-sm text-gray-500">
                    Requested: {new Date(request.requestedAt).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                    <p className="text-sm text-gray-500">Available Balance</p>
                    <p className="font-medium text-gray-900">
                      ₱{request.availableBalance?.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {renderActions(request)}
                  </div>
                </div>

                {request.adminNotes && (
                  <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
                    <strong>Admin Notes:</strong> {request.adminNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}