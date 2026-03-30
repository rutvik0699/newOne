import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Loading from '../components/Loading';
import { getDashboardStats, getRecentOrders, getMonthlySales } from '../services/api';
import { AppContext } from '../context/AppContext';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
  Shipped: 'bg-purple-100 text-purple-800',
};

const Dashboard = () => {
  const { showToast } = useContext(AppContext);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, ordersRes, salesRes] = await Promise.allSettled([
          getDashboardStats(),
          getRecentOrders(),
          getMonthlySales(),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (ordersRes.status === 'fulfilled') setRecentOrders(ordersRes.value.data?.orders || ordersRes.value.data || []);
        if (salesRes.status === 'fulfilled') setMonthlySales(salesRes.value.data?.sales || salesRes.value.data || []);
      } catch {
        showToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showToast]);

  if (loading) return <Loading fullScreen />;

  const maxSales = Math.max(...monthlySales.map(s => s.totalRevenue || s.total || s.amount || 0), 1);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/orders/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + New Order
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Total Orders" value={stats?.totalOrders ?? '—'} icon="📦" color="blue" trend={stats?.ordersTrend} />
        <Card title="Total Revenue" value={stats?.totalRevenue ? `$${Number(stats.totalRevenue).toLocaleString()}` : '—'} icon="💰" color="green" trend={stats?.revenueTrend} />
        <Card title="Total Items" value={stats?.totalItems ?? '—'} icon="🏷️" color="yellow" trend={stats?.itemsTrend} />
        <Card title="Total Users" value={stats?.totalUsers ?? '—'} icon="👥" color="red" trend={stats?.usersTrend} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Sales</h2>
          {monthlySales.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">No sales data available</div>
          ) : (
            <div className="flex items-end gap-2 h-48 overflow-x-auto pb-2">
              {monthlySales.map((item, idx) => {
                const value = item.totalRevenue || item.total || item.amount || 0;
                const height = Math.max((value / maxSales) * 100, 2);
                return (
                  <div key={idx} className="flex flex-col items-center gap-1 flex-1 min-w-[40px]">
                    <span className="text-xs text-gray-500 whitespace-nowrap">${value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}</span>
                    <div
                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                      style={{ height: `${height}%` }}
                      title={`${item.month || item.label || idx}: $${value}`}
                    />
                    <span className="text-xs text-gray-500 whitespace-nowrap">{item.month || item.label || `M${idx + 1}`}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
          <div className="space-y-3">
            {stats?.ordersByStatus && Object.entries(stats.ordersByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                  {status}
                </span>
                <span className="text-sm font-medium text-gray-700">{count}</span>
              </div>
            ))}
            {!stats?.ordersByStatus && (
              <p className="text-gray-400 text-sm">No status data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link to="/orders" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="pb-3 pr-4">Order #</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Total</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-sm">No recent orders</td></tr>
              ) : (
                recentOrders.slice(0, 10).map((order) => (
                  <tr key={order._id || order.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 text-sm font-medium text-blue-600">#{order.orderNumber || order._id?.slice(-6)}</td>
                    <td className="py-3 pr-4 text-sm text-gray-700">{order.customer?.name || order.customerName || '—'}</td>
                    <td className="py-3 pr-4 text-sm text-gray-700">${Number(order.total || 0).toFixed(2)}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {order.status || '—'}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
