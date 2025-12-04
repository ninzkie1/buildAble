import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUp, ArrowDown, Package, DollarSign, ShoppingCart, AlertCircle, Wallet, CreditCard, X } from 'lucide-react';
import config from "../../config/config";
export default function SellerHome() {
    const [salesData, setSalesData] = useState([]);
    const [statistics, setStatistics] = useState({
        totalSales: 0,
        totalOrders: 0,
        cancelledOrders: 0,
        revenue: 0
    });
    const [dailyStatistics, setDailyStatistics] = useState({
        totalSales: 0,
        totalOrders: 0,
        cancelledOrders: 0,
        revenue: 0
    });
    const [availableBalance, setAvailableBalance] = useState(0);
    const [orderStatusData, setOrderStatusData] = useState([]);
    const [withdrawalRequests, setWithdrawalRequests] = useState([]);
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [withdrawalForm, setWithdrawalForm] = useState({
        amount: '',
        paymentMethod: 'bank_transfer',
        paymentDetails: '',
        // structured details per method
        bankName: '',
        bankAccountName: '',
        bankAccountNumber: '',
        gcashNumber: '',
        gcashName: '',
        paypalEmail: '',
        otherDetails: ''
    });
    const [changes, setChanges] = useState({
        revenue: 0,
        orders: 0,
        sales: 0,
        cancelled: 0
    });
    const [loading, setLoading] = useState(true);

    // Update colors to match status
    const COLORS = {
        pending: '#FFA500',    // Orange
        processing: '#3B82F6', // Blue
        shipped: '#8B5CF6',    // Purple
        delivered: '#10B981',  // Green
        cancelled: '#EF4444'   // Red
    };

    const fetchWithdrawalRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${config.apiUrl}/api/seller/withdrawals`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setWithdrawalRequests(data.withdrawalRequests || []);
                // Do not override available balance here; the dashboard API already returns the latest computed value.
            }
        } catch (error) {
            console.error('Error fetching withdrawal requests:', error);
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${config.apiUrl}/api/seller/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                
                if (response.ok) {
                    const stats = data.statistics || {};
                    const normalizedStats = {
                        totalSales: Number(stats.totalSales ?? 0),
                        totalOrders: Number(stats.totalOrders ?? 0),
                        cancelledOrders: Number(stats.cancelledOrders ?? 0),
                        revenue: Number(stats.revenue ?? 0),
                        changes: stats.changes || {
                            revenue: 0,
                            orders: 0,
                            sales: 0,
                            cancelled: 0
                        }
                    };

                    const normalizedDaily = {
                        totalSales: Number(data.dailyStatistics?.totalSales ?? 0),
                        totalOrders: Number(data.dailyStatistics?.totalOrders ?? 0),
                        cancelledOrders: Number(data.dailyStatistics?.cancelledOrders ?? 0),
                        revenue: Number(data.dailyStatistics?.revenue ?? 0)
                    };

                    setSalesData(data.salesData || []);
                    setStatistics(normalizedStats);
                    setDailyStatistics(normalizedDaily);
                    setAvailableBalance(Number(data.availableBalance ?? 0));
                    setChanges(normalizedStats.changes);
                    
                    // Transform order status data for pie chart
                    const statusData = Object.entries(data.orderStatusData || {}).map(([status, count]) => ({
                        name: status.charAt(0).toUpperCase() + status.slice(1),
                        value: count,
                        color: COLORS[status]
                    }));
                    setOrderStatusData(statusData);
                    
                    // Fetch withdrawal requests
                    fetchWithdrawalRequests();
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleWithdrawalSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            // Prepare a human-readable paymentDetails string from structured inputs
            const form = withdrawalForm;
            let paymentDetailsStr = form.paymentDetails || '';
            switch (form.paymentMethod) {
                case 'bank_transfer':
                    paymentDetailsStr = `Bank: ${form.bankName || '-'}, Account Name: ${form.bankAccountName || '-'}, Account #: ${form.bankAccountNumber || '-'}`;
                    break;
                case 'gcash':
                    paymentDetailsStr = `GCash Name: ${form.gcashName || '-'}, Number: ${form.gcashNumber || '-'}`;
                    break;
                case 'paypal':
                    paymentDetailsStr = `PayPal Email: ${form.paypalEmail || '-'}`;
                    break;
                default:
                    paymentDetailsStr = form.otherDetails || form.paymentDetails || '';
            }

            const response = await fetch(`${config.apiUrl}/api/seller/withdrawals`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: withdrawalForm.amount,
                    paymentMethod: withdrawalForm.paymentMethod,
                    paymentDetails: paymentDetailsStr
                })
            });
            const data = await response.json();
            if (response.ok) {
                alert('Withdrawal request submitted successfully!');
                setShowWithdrawalModal(false);
                setWithdrawalForm({ amount: '', paymentMethod: 'bank_transfer', paymentDetails: '' });
                fetchWithdrawalRequests();
                // Refresh dashboard to update balance
                window.location.reload();
            } else {
                alert(data.message || 'Failed to submit withdrawal request');
            }
        } catch (error) {
            console.error('Error submitting withdrawal request:', error);
            alert('Error submitting withdrawal request');
        }
    };

    const formattedBalance = Number(availableBalance ?? 0).toFixed(2);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B84937]"></div>
            </div>
        );
    }

    const sortedWithdrawalRequests = [...withdrawalRequests].sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Seller Dashboard</h1>
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full md:w-auto">
                    <div className="bg-white p-4 rounded-lg shadow-sm flex-1 sm:flex-none">
                        <div className="flex items-center gap-2">
                            <Wallet className="text-blue-500" />
                            <div>
                                <p className="text-xs text-gray-500">Available Balance</p>
                                <p className="text-xl font-bold text-gray-800">₱{formattedBalance}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowWithdrawalModal(true)}
                        disabled={availableBalance <= 0}
                        className="bg-[#B84937] text-white px-6 py-2 rounded-lg hover:bg-[#9a3d2e] disabled:bg-gray-400 disabled:cursor-not-allowed transition w-full sm:w-auto"
                    >
                        Request Withdrawal
                    </button>
                </div>
            </div>

            {/* Daily Statistics Cards */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                    <StatCard 
                        title="Today's Revenue"
                        value={`₱${dailyStatistics.revenue?.toFixed(2) || '0.00'}`}
                        icon={<DollarSign className="text-green-500" />}
                        isDaily={true}
                    />
                    <StatCard 
                        title="Today's Orders"
                        value={dailyStatistics.totalOrders || 0}
                        icon={<ShoppingCart className="text-blue-500" />}
                        isDaily={true}
                    />
                    <StatCard 
                        title="Products Sold Today"
                        value={dailyStatistics.totalSales || 0}
                        icon={<Package className="text-orange-500" />}
                        isDaily={true}
                    />
                    <StatCard 
                        title="Cancelled Today"
                        value={dailyStatistics.cancelledOrders || 0}
                        icon={<AlertCircle className="text-red-500" />}
                        isDaily={true}
                    />
                </div>
            </div>

            {/* Monthly Statistics Cards */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                <StatCard 
                    title="Monthly Revenue"
                    value={`₱${statistics.revenue.toFixed(2)}`}
                    icon={<DollarSign className="text-green-500" />}
                    change={changes.revenue}
                />
                <StatCard 
                    title="Total Orders"
                    value={statistics.totalOrders}
                    icon={<ShoppingCart className="text-blue-500" />}
                    change={changes.orders}
                />
                <StatCard 
                    title="Products Sold (This Month)"
                    value={statistics.totalSales}
                    icon={<Package className="text-orange-500" />}
                    change={changes.sales}
                />
                <StatCard 
                    title="Cancelled Orders"
                    value={statistics.cancelledOrders}
                    icon={<AlertCircle className="text-red-500" />}
                    change={changes.cancelled}
                    isNegative={changes.cancelled > 0}
                />
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Trend Chart */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Sales Trend</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="sales" stroke="#B84937" />
                                <Line type="monotone" dataKey="revenue" stroke="#22c55e" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Status Distribution */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Order Status Distribution</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={orderStatusData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {orderStatusData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.color || '#000000'} 
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Withdrawal Requests Section */}
            {sortedWithdrawalRequests.length > 0 && (
                <div id="withdrawals" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Pending Requests */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Pending Requests</h2>
                        {sortedWithdrawalRequests.filter(req => req.status === 'pending' || req.status === 'approved').length === 0 ? (
                            <p className="text-sm text-gray-500">No pending withdrawals</p>
                        ) : (
                            <div className="space-y-3">
                                {sortedWithdrawalRequests
                                    .filter(req => req.status === 'pending' || req.status === 'approved')
                                    .map((request, index) => (
                                        <div key={index} className="border rounded-lg p-3 bg-gray-50">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold text-gray-900">₱{request.amount?.toFixed(2)}</p>
                                                    <p className="text-sm text-gray-500 capitalize">{request.paymentMethod?.replace('_', ' ')}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    request.status === 'approved' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {request.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Requested: {new Date(request.requestedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* Withdrawal History */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Withdrawal History</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Amount</th>
                                        <th className="text-left py-2">Status</th>
                                        <th className="text-left py-2">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedWithdrawalRequests.map((request, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="py-2">₱{request.amount?.toFixed(2)}</td>
                                            <td className="py-2">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    request.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    request.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                                    request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td className="py-2">{new Date(request.requestedAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdrawal Modal */}
            {showWithdrawalModal && (
                <WithdrawalModal
                    availableBalance={availableBalance}
                    form={withdrawalForm}
                    setForm={setWithdrawalForm}
                    onSubmit={handleWithdrawalSubmit}
                    onClose={() => setShowWithdrawalModal(false)}
                />
            )}
        </div>
    );
}

// Statistic Card Component
function StatCard({ title, value, icon, change, isNegative, isDaily }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-gray-500 text-sm">{title}</h3>
                    <p className="text-2xl font-semibold mt-1">{value}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-full">
                    {icon}
                </div>
            </div>
            {!isDaily && (
                <div className={`flex items-center ${isNegative ? 'text-red-500' : 'text-green-500'}`}>
                    {isNegative ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
                    <span className="text-sm font-medium ml-1">{Math.abs(change)}%</span>
                    <span className="text-gray-500 text-sm ml-1">from last month</span>
                </div>
            )}
        </div>
    );
}

// Withdrawal Modal Component
function WithdrawalModal({ availableBalance, form, setForm, onSubmit, onClose }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold">Request Withdrawal</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Available Balance</label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-2xl font-bold text-gray-800">₱{availableBalance.toFixed(2)}</p>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Amount to Withdraw</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max={availableBalance}
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B84937] focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Payment Method</label>
                        <select
                            name="paymentMethod"
                            value={form.paymentMethod}
                            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B84937] focus:border-transparent"
                            required
                        >
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="gcash">GCash</option>
                            <option value="paypal">PayPal</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Conditional fields by method */}
                    {form.paymentMethod === 'bank_transfer' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-2">Bank Name</label>
                                <input
                                    name="bankName"
                                    value={form.bankName}
                                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                                    placeholder="e.g., BDO, BPI"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B84937] focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Account Name</label>
                                <input
                                    name="bankAccountName"
                                    value={form.bankAccountName}
                                    onChange={(e) => setForm({ ...form, bankAccountName: e.target.value })}
                                    placeholder="Account holder's name"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B84937] focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Account Number</label>
                                <input
                                    name="bankAccountNumber"
                                    value={form.bankAccountNumber}
                                    onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
                                    placeholder="Account number"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B84937] focus:border-transparent"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {form.paymentMethod === 'gcash' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-2">GCash Name</label>
                                <input
                                    name="gcashName"
                                    value={form.gcashName}
                                    onChange={(e) => setForm({ ...form, gcashName: e.target.value })}
                                    placeholder="Name on GCash account"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B84937] focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">GCash Number</label>
                                <input
                                    name="gcashNumber"
                                    value={form.gcashNumber}
                                    onChange={(e) => setForm({ ...form, gcashNumber: e.target.value })}
                                    placeholder="Mobile number linked to GCash"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B84937] focus:border-transparent"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {form.paymentMethod === 'paypal' && (
                        <div>
                            <label className="block text-sm font-medium mb-2">PayPal Email</label>
                            <input
                                name="paypalEmail"
                                value={form.paypalEmail}
                                onChange={(e) => setForm({ ...form, paypalEmail: e.target.value })}
                                placeholder="PayPal account email"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B84937] focus:border-transparent"
                                required
                            />
                        </div>
                    )}

                    {form.paymentMethod === 'other' && (
                        <div>
                            <label className="block text-sm font-medium mb-2">Payment Details</label>
                            <textarea
                                name="otherDetails"
                                value={form.otherDetails}
                                onChange={(e) => setForm({ ...form, otherDetails: e.target.value })}
                                placeholder="Provide payment instructions or details"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B84937] focus:border-transparent"
                                rows="3"
                                required
                            />
                        </div>
                    )}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-[#B84937] text-white rounded-lg hover:bg-[#9a3d2e] transition"
                        >
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}