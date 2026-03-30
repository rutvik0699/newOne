import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { ENDPOINTS, ORDER_STATUS } from '../constants/api';
import { AppContext } from '../context/AppContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Loading from '../components/Loading';
import { formatCurrency } from '../services/formatters';

const EditOrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useContext(AppContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ status: '', notes: '', deliveryDate: '' });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(ENDPOINTS.ORDERS.BY_ID(id));
        const o = data.data;
        setOrder(o);
        setForm({
          status: o.status,
          notes: o.notes || '',
          deliveryDate: o.deliveryDate ? o.deliveryDate.split('T')[0] : '',
        });
      } catch (err) {
        showError(err.message);
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate, showError]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(ENDPOINTS.ORDERS.BY_ID(id), form);
      showSuccess('Order updated successfully');
      navigate('/orders');
    } catch (err) {
      showError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading fullPage />;
  if (!order) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Order</h1>
        <p className="text-gray-500 mt-1">Order {order.orderNumber}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Order Items</h2>
        <div className="space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
              <span>{item.itemId?.name || 'Unknown'}</span>
              <span className="text-gray-600">x{item.quantity} @ {formatCurrency(item.price)}</span>
            </div>
          ))}
          <div className="flex justify-end pt-2 font-bold">
            Total: {formatCurrency(order.totalAmount)}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Update Details</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.values(ORDER_STATUS).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <Input
          label="Delivery Date"
          name="deliveryDate"
          type="date"
          value={form.deliveryDate}
          onChange={handleChange}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate('/orders')}>Cancel</Button>
          <Button type="submit" loading={saving}>Update Order</Button>
        </div>
      </form>
    </div>
  );
};

export default EditOrderPage;
