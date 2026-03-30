import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';
import { ENDPOINTS } from '../constants/api';
import { AppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { USER_ROLES } from '../constants/api';
import Table from '../components/Table';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { ConfirmModal } from '../components/Modal';
import { formatCurrency } from '../services/formatters';

const ItemsPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useContext(AppContext);
  const isAdmin = user?.role === USER_ROLES.ADMIN;

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', quantity: '', category: '', sku: '' });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, ...(search && { search }), ...(category && { category }) };
      const { data } = await api.get(ENDPOINTS.ITEMS.BASE, { params });
      setItems(data.data);
      setPagination(data.pagination);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, showError]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => {
    setEditItem(null);
    setFormData({ name: '', description: '', price: '', quantity: '', category: '', sku: '' });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      quantity: item.quantity,
      category: item.category || '',
      sku: item.sku || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.price || Number(formData.price) <= 0) errs.price = 'Price must be > 0';
    if (formData.quantity === '' || Number(formData.quantity) < 0) errs.quantity = 'Quantity must be ≥ 0';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = { ...formData, price: Number(formData.price), quantity: Number(formData.quantity) };
      if (editItem) {
        await api.put(ENDPOINTS.ITEMS.BY_ID(editItem._id), payload);
        showSuccess('Item updated successfully');
      } else {
        await api.post(ENDPOINTS.ITEMS.BASE, payload);
        showSuccess('Item created successfully');
      }
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      showError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(ENDPOINTS.ITEMS.BY_ID(deleteTarget._id));
      showSuccess('Item deleted');
      setDeleteTarget(null);
      fetchItems();
    } catch (err) {
      showError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category', render: (v) => v || '—' },
    { key: 'price', label: 'Price', render: (v) => formatCurrency(v) },
    { key: 'quantity', label: 'Stock' },
    { key: 'sku', label: 'SKU', render: (v) => v || '—' },
    ...(isAdmin ? [{
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => openEdit(row)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => setDeleteTarget(row)}>Delete</Button>
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Items</h1>
          <p className="text-gray-500 mt-1">Manage your product catalog</p>
        </div>
        {isAdmin && <Button onClick={openCreate}>+ Add Item</Button>}
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          name="search"
          placeholder="Search items..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-64"
        />
        <Input
          name="category"
          placeholder="Filter by category"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="w-48"
        />
      </div>

      <Table columns={columns} data={items} loading={loading} pagination={pagination} onPageChange={setPage} />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Item' : 'Create Item'}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editItem ? 'Update' : 'Create'}</Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <Input label="Name" name="name" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} error={formErrors.name} required />
          <Input label="Description" name="description" value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price ($)" name="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))} error={formErrors.price} required />
            <Input label="Quantity" name="quantity" type="number" value={formData.quantity} onChange={(e) => setFormData(p => ({ ...p, quantity: e.target.value }))} error={formErrors.quantity} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" name="category" value={formData.category} onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))} />
            <Input label="SKU" name="sku" value={formData.sku} onChange={(e) => setFormData(p => ({ ...p, sku: e.target.value }))} />
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Item"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
      />
    </div>
  );
};

export default ItemsPage;
