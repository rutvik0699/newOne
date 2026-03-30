import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { getOrders, updateOrder, deleteOrder } from '../services/api';
import { AppContext } from '../context/AppContext';

const STATUS_OPTIONS = ['', 'pending', 'processing', 'shipped', 'completed', 'cancelled'];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  shipped: 'bg-purple-100 text-purple-800',
};

const Orders = () => {
  const { showToast } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewOrder, setViewOrder] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await getOrders(params);
      const d = res.data;
      setOrders(d.orders || d.data || d || []);
      setTotalPages(d.totalPages || d.pagination?.totalPages || 1);
    } catch {
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, status, startDate, endDate, page, showToast]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async () => {
    if (!statusModal || !newStatus) return;
    try {
      await updateOrder(statusModal._id || statusModal.id, { status: newStatus });
      showToast('Order status updated', 'success');
      setStatusModal(null);
      fetchOrders();
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await deleteOrder(deleteModal._id || deleteModal.id);
      showToast('Order deleted successfully', 'success');
      setDeleteModal(null);
      fetchOrders();
    } catch {
      showToast('Failed to delete order', 'error');
    }
  };

  const columns = [
    { key: 'orderNumber', label: 'Order #', render: (v, r) => `#${v || r._id?.slice(-6) || '—'}` },
    { key: 'customer', label: 'Customer', render: (v, r) => v?.name || r.customerName || '—' },
    { key: 'items', label: 'Items', render: (v) => Array.isArray(v) ? v.length : (v || 0) },
    { key: 'total', label: 'Total', render: (v) => `$${Number(v || 0).toFixed(2)}` },
    {
      key: 'status', label: 'Status',
      render: (v) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[v] || 'bg-gray-100 text-gray-800'}`}>
          {v || '—'}
        </span>
      )
    },
    { key: 'createdAt', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setViewOrder(row)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">View</button>
          <Link to={`/orders/${row._id || row.id}/edit`} className="text-green-600 hover:text-green-800 text-xs font-medium">Edit</Link>
          <button onClick={() => { setStatusModal(row); setNewStatus(row.status || ''); }} className="text-purple-600 hover:text-purple-800 text-xs font-medium">Status</button>
          <button onClick={() => setDeleteModal(row)} className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <Link to="/orders/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + New Order
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>)}
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => { setSearch(''); setStatus(''); setStartDate(''); setEndDate(''); setPage(1); }}
            className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Table columns={columns} data={orders} loading={loading} pagination={{ page, totalPages, onPageChange: setPage }} />
      </div>

      {/* View Order Modal */}
      <Modal isOpen={!!viewOrder} onClose={() => setViewOrder(null)} title={`Order #${viewOrder?.orderNumber || viewOrder?._id?.slice(-6)}`} size="lg">
        {viewOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium text-gray-600">Customer:</span> <span className="text-gray-900">{viewOrder.customer?.name || viewOrder.customerName || '—'}</span></div>
              <div><span className="font-medium text-gray-600">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[viewOrder.status] || 'bg-gray-100 text-gray-800'}`}>{viewOrder.status}</span></div>
              <div><span className="font-medium text-gray-600">Total:</span> <span className="text-gray-900 font-bold">${Number(viewOrder.total || 0).toFixed(2)}</span></div>
              <div><span className="font-medium text-gray-600">Date:</span> <span className="text-gray-900">{viewOrder.createdAt ? new Date(viewOrder.createdAt).toLocaleString() : '—'}</span></div>
            </div>
            {viewOrder.notes && <div className="text-sm"><span className="font-medium text-gray-600">Notes:</span> <p className="text-gray-700 mt-1">{viewOrder.notes}</p></div>}
            {Array.isArray(viewOrder.items) && viewOrder.items.length > 0 && (
              <div>
                <p className="font-medium text-gray-600 text-sm mb-2">Items:</p>
                <table className="min-w-full text-sm divide-y divide-gray-200">
                  <thead><tr className="text-left text-xs text-gray-500 uppercase"><th className="pb-2">Item</th><th className="pb-2">Qty</th><th className="pb-2">Price</th><th className="pb-2">Subtotal</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {viewOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2">{item.name || item.item?.name || '—'}</td>
                        <td className="py-2">{item.quantity}</td>
                        <td className="py-2">${Number(item.price || 0).toFixed(2)}</td>
                        <td className="py-2">${Number((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal isOpen={!!statusModal} onClose={() => setStatusModal(null)} title="Update Order Status" size="sm">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.filter(s => s).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={() => setStatusModal(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
          <button onClick={handleStatusUpdate} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Update</button>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Order" size="sm">
        <p className="text-gray-600 text-sm mb-4">Are you sure you want to delete order <strong>#{deleteModal?.orderNumber || deleteModal?._id?.slice(-6)}</strong>?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteModal(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default Orders;
