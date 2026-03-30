import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ENDPOINTS } from '../constants/api';
import { AppContext } from '../context/AppContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { formatCurrency } from '../services/formatters';

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useContext(AppContext);
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await api.get(ENDPOINTS.ITEMS.BASE, { params: { limit: 100 } });
        setAvailableItems(data.data);
      } catch (err) {
        showError('Failed to load items');
      } finally {
        setItemsLoading(false);
      }
    };
    fetchItems();
  }, [showError]);

  const addItem = (itemId) => {
    const item = availableItems.find((i) => i._id === itemId);
    if (!item) return;
    const exists = selectedItems.find((i) => i.itemId === itemId);
    if (exists) {
      setSelectedItems((prev) =>
        prev.map((i) => (i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i))
      );
    } else {
      setSelectedItems((prev) => [...prev, { itemId, name: item.name, price: item.price, quantity: 1 }]);
    }
  };

  const removeItem = (itemId) => {
    setSelectedItems((prev) => prev.filter((i) => i.itemId !== itemId));
  };

  const updateQuantity = (itemId, qty) => {
    const q = Math.max(1, parseInt(qty, 10) || 1);
    setSelectedItems((prev) =>
      prev.map((i) => (i.itemId === itemId ? { ...i, quantity: q } : i))
    );
  };

  const total = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      showError('Please add at least one item');
      return;
    }
    setLoading(true);
    try {
      await api.post(ENDPOINTS.ORDERS.BASE, {
        items: selectedItems.map(({ itemId, quantity }) => ({ itemId, quantity })),
        notes,
        ...(deliveryDate && { deliveryDate }),
      });
      showSuccess('Order created successfully!');
      navigate('/orders');
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
        <p className="text-gray-500 mt-1">Select items and configure your order</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item selection */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Select Items</h2>
          {itemsLoading ? (
            <p className="text-gray-400">Loading items...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto">
              {availableItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => addItem(item._id)}
                >
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(item.price)} • Stock: {item.quantity}</p>
                  </div>
                  <Button size="sm" variant="outline" type="button">+ Add</Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected items */}
        {selectedItems.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-3">
              {selectedItems.map((item) => (
                <div key={item.itemId} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.itemId, e.target.value)}
                      className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center"
                    />
                    <span className="text-sm font-medium w-20 text-right">{formatCurrency(item.price * item.quantity)}</span>
                    <button type="button" onClick={() => removeItem(item.itemId)} className="text-red-500 hover:text-red-700 text-lg leading-none">×</button>
                  </div>
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <p className="text-lg font-bold">Total: {formatCurrency(total)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Order details */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Order Details</h2>
          <Input
            label="Delivery Date"
            name="deliveryDate"
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional order notes..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate('/orders')}>Cancel</Button>
          <Button type="submit" loading={loading} disabled={selectedItems.length === 0}>
            Create Order ({formatCurrency(total)})
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrderPage;
