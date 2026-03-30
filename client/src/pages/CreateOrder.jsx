import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getItems, createOrder, updateOrder, getOrder } from '../services/api';
import { AppContext } from '../context/AppContext';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];

const CreateOrder = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useContext(AppContext);

  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [status, setStatus] = useState('pending');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchItem, setSearchItem] = useState('');

  const total = selectedItems.reduce((sum, si) => sum + (si.price * si.quantity), 0);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await getItems({ limit: 100, status: 'active' });
        const d = res.data;
        setAvailableItems(d.items || d.data || d || []);
      } catch {
        showToast('Failed to load items', 'error');
      }
    };
    fetchItems();
  }, [showToast]);

  useEffect(() => {
    if (isEdit) {
      const fetchOrder = async () => {
        setLoading(true);
        try {
          const res = await getOrder(id);
          const order = res.data;
          setStatus(order.status || 'pending');
          setNotes(order.notes || '');
          if (Array.isArray(order.items)) {
            setSelectedItems(order.items.map(i => ({
              _id: i.item?._id || i._id || i.id,
              name: i.item?.name || i.name || '—',
              price: i.price || i.item?.price || 0,
              quantity: i.quantity || 1,
              sku: i.item?.sku || i.sku || '',
            })));
          }
        } catch {
          showToast('Failed to load order', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id, isEdit, showToast]);

  const addItem = (item) => {
    setSelectedItems(prev => {
      const existing = prev.find(si => si._id === (item._id || item.id));
      if (existing) return prev.map(si => si._id === existing._id ? { ...si, quantity: si.quantity + 1 } : si);
      return [...prev, { _id: item._id || item.id, name: item.name, price: item.price || 0, quantity: 1, sku: item.sku || '' }];
    });
  };

  const updateQty = (itemId, qty) => {
    if (qty < 1) { removeItem(itemId); return; }
    setSelectedItems(prev => prev.map(si => si._id === itemId ? { ...si, quantity: qty } : si));
  };

  const removeItem = (itemId) => {
    setSelectedItems(prev => prev.filter(si => si._id !== itemId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) { showToast('Please add at least one item', 'error'); return; }
    setSubmitting(true);
    try {
      const payload = {
        items: selectedItems.map(si => ({ item: si._id, quantity: si.quantity, price: si.price })),
        status,
        notes,
        total,
      };
      if (isEdit) {
        await updateOrder(id, payload);
        showToast('Order updated successfully', 'success');
      } else {
        await createOrder(payload);
        showToast('Order created successfully', 'success');
      }
      navigate('/orders');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = availableItems.filter(item =>
    item.name?.toLowerCase().includes(searchItem.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchItem.toLowerCase())
  );

  if (loading) return <div className="p-6 flex justify-center"><div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/orders')} className="text-gray-500 hover:text-gray-700">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Order' : 'Create Order'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items Selection */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Available Items</h2>
              <input
                type="text"
                placeholder="Search items..."
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {filteredItems.map(item => (
                  <div
                    key={item._id || item.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
                    onClick={() => addItem(item)}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.sku} • ${Number(item.price || 0).toFixed(2)}</p>
                    </div>
                    <button type="button" className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center text-lg leading-none hover:bg-blue-200">+</button>
                  </div>
                ))}
                {filteredItems.length === 0 && (
                  <p className="text-gray-400 text-sm col-span-2 text-center py-4">No items found</p>
                )}
              </div>
            </div>

            {/* Selected Items */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Selected Items ({selectedItems.length})</h2>
              {selectedItems.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No items selected. Click items above to add.</p>
              ) : (
                <div className="space-y-2">
                  {selectedItems.map(si => (
                    <div key={si._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{si.name}</p>
                        <p className="text-xs text-gray-500">${Number(si.price).toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => updateQty(si._id, si.quantity - 1)} className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-200">-</button>
                        <input
                          type="number"
                          min="1"
                          value={si.quantity}
                          onChange={(e) => updateQty(si._id, parseInt(e.target.value) || 1)}
                          className="w-12 text-center border border-gray-300 rounded text-sm py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button type="button" onClick={() => updateQty(si._id, si.quantity + 1)} className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-200">+</button>
                        <span className="w-20 text-right text-sm font-medium text-gray-700">${(si.price * si.quantity).toFixed(2)}</span>
                        <button type="button" onClick={() => removeItem(si._id)} className="text-red-500 hover:text-red-700 ml-1">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Order Details</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Order notes..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Items ({selectedItems.length})</span>
                  <span>{selectedItems.reduce((s, i) => s + i.quantity, 0)} units</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting || selectedItems.length === 0}
                className="w-full mt-4 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Saving...' : isEdit ? 'Update Order' : 'Create Order'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="w-full mt-2 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;
