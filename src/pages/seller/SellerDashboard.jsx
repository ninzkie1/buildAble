import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUp, ArrowDown, Package, DollarSign, ShoppingCart, AlertCircle } from 'lucide-react';

export default function SellerHome() {
    const [salesData, setSalesData] = useState([]);
    const [statistics, setStatistics] = useState({
        totalSales: 0,
        totalOrders: 0,
        cancelledOrders: 0,
        revenue: 0
    });
    const [orderStatusData, setOrderStatusData] = useState([]); // Add this state
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

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/seller/dashboard', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                
                if (response.ok) {
                    setSalesData(data.salesData);
                    setStatistics(data.statistics);
                    setChanges(data.statistics.changes);
                    
                    // Transform order status data for pie chart
                    const statusData = Object.entries(data.orderStatusData || {}).map(([status, count]) => ({
                        name: status.charAt(0).toUpperCase() + status.slice(1),
                        value: count,
                        color: COLORS[status]
                    }));
                    setOrderStatusData(statusData);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B84937]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Seller Dashboard</h1>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Total Sales"
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
                    title="Products Sold"
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
        </div>
    );
}

// Statistic Card Component
function StatCard({ title, value, icon, change, isNegative }) {
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
            <div className={`flex items-center ${isNegative ? 'text-red-500' : 'text-green-500'}`}>
                {isNegative ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
                <span className="text-sm font-medium ml-1">{Math.abs(change)}%</span>
                <span className="text-gray-500 text-sm ml-1">from last month</span>
            </div>
        </div>
    );
}