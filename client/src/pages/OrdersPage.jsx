import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { ENDPOINTS, ORDER_STATUS, USER_ROLES } from '../constants/api';
import { AppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import Table from '../components/Table';
import Button from '../components/Button';
import Input from '../components/Input';
import { ConfirmModal } from '../components/Modal';
import { formatCurrency, formatDate, exportToCSV } from '../services/formatters';

const statusBadge = (status) => {
  const classes = {
    [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
    [ORDER_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
    [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${classes[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const OrdersPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useContext(AppContext);
  const isAdmin = user?.role === USER_ROLES.ADMIN;

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', status: '', startDate: '', endDate: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const { data } = await api.get(ENDPOINTS.ORDERS.BASE, { params });
      setOrders(data.data);
      setPagination(data.pagination);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, filters, showError]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleFilterChange = (e) => {
    setFilters((p) => ({ ...p, [e.target.name]: e.target.value }));
    setPage(1);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(ENDPOINTS.ORDERS.BY_ID(deleteTarget._id));
      showSuccess('Order deleted');
      setDeleteTarget(null);
      fetchOrders();
    } catch (err) {
      showError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    exportToCSV(orders, 'orders.csv');
    showSuccess('Orders exported to CSV');
  };

  const columns = [
    { key: 'orderNumber', label: 'Order #', render: (v, row) => <Link to={`/orders/${row._id}`} className="text-blue-600 hover:underline font-medium">{v}</Link> },
    ...(isAdmin ? [{ key: 'userId', label: 'Customer', render: (v) => v?.name || '—' }] : []),
    { key: 'orderDate', label: 'Date', render: (v) => formatDate(v) },
    { key: 'status', label: 'Status', render: (v) => statusBadge(v) },
    { key: 'totalAmount', label: 'Total', render: (v) => formatCurrency(v) },
    { key: 'items', label: 'Items', render: (v) => v?.length || 0 },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Link to={`/orders/${row._id}/edit`}>
            <Button size="sm" variant="outline">Edit</Button>
          </Link>
          <Button size="sm" variant="danger" onClick={() => setDeleteTarget(row)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">Manage customer orders</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>Export CSV</Button>
          <Link to="/orders/create"><Button>+ New Order</Button></Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input name="search" placeholder="Search by order #" value={filters.search} onChange={handleFilterChange} className="w-52" />
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {Object.values(ORDER_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Input name="startDate" type="date" value={filters.startDate} onChange={handleFilterChange} />
        <Input name="endDate" type="date" value={filters.endDate} onChange={handleFilterChange} />
      </div>

      <Table columns={columns} data={orders} loading={loading} pagination={pagination} onPageChange={setPage} />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Order"
        message={`Delete order "${deleteTarget?.orderNumber}"? This cannot be undone.`}
      />
    </div>
  );
};

export default OrdersPage;
