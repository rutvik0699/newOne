import React, { useEffect, useState, useContext, useCallback } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Form from '../components/Form';
import { getItems, createItem, updateItem, deleteItem } from '../services/api';
import { AppContext } from '../context/AppContext';
import useForm from '../hooks/useForm';

const STATUS_OPTIONS = ['active', 'inactive'];
const CATEGORY_OPTIONS = ['Electronics', 'Clothing', 'Food', 'Books', 'Other'];

const itemInitial = { name: '', sku: '', category: '', price: '', quantity: '', status: 'active', description: '' };

const validateItem = (values) => {
  const errors = {};
  if (!values.name) errors.name = 'Name is required';
  if (!values.sku) errors.sku = 'SKU is required';
  if (!values.price || isNaN(values.price)) errors.price = 'Valid price is required';
  if (!values.quantity || isNaN(values.quantity)) errors.quantity = 'Valid quantity is required';
  return errors;
};

const Items = () => {
  const { showToast } = useContext(AppContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { values, errors, handleChange, handleSubmit, reset, setValues } = useForm(itemInitial);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getItems({ search, page, limit: 10 });
      const d = res.data;
      setItems(d.items || d.data || d || []);
      setTotalPages(d.totalPages || d.pagination?.totalPages || 1);
    } catch {
      showToast('Failed to load items', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, page, showToast]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => {
    setEditItem(null);
    reset(itemInitial);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setValues({
      name: item.name || '',
      sku: item.sku || '',
      category: item.category || '',
      price: item.price?.toString() || '',
      quantity: item.quantity?.toString() || '',
      status: item.status || 'active',
      description: item.description || '',
    });
    setModalOpen(true);
  };

  const onSubmit = async (formValues) => {
    setSubmitting(true);
    try {
      if (editItem) {
        await updateItem(editItem._id || editItem.id, formValues);
        showToast('Item updated successfully', 'success');
      } else {
        await createItem(formValues);
        showToast('Item created successfully', 'success');
      }
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save item', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await deleteItem(deleteModal._id || deleteModal.id);
      showToast('Item deleted successfully', 'success');
      setDeleteModal(null);
      fetchItems();
    } catch {
      showToast('Failed to delete item', 'error');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'sku', label: 'SKU' },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Price', render: (v) => `$${Number(v || 0).toFixed(2)}` },
    { key: 'quantity', label: 'Quantity' },
    {
      key: 'status', label: 'Status',
      render: (v) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
          v === 'active' ? 'bg-green-100 text-green-800' :
          v === 'inactive' ? 'bg-gray-100 text-gray-800' :
          'bg-red-100 text-red-800'
        }`}>{v || '—'}</span>
      )
    },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
          <button onClick={() => setDeleteModal(row)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Items</h1>
        <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + Add Item
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Table
          columns={columns}
          data={items}
          loading={loading}
          pagination={{ page, totalPages, onPageChange: setPage }}
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Item' : 'Add Item'} size="md">
        <form onSubmit={handleSubmit(onSubmit, validateItem)} noValidate>
          <div className="grid grid-cols-2 gap-4">
            <Form label="Name" error={errors.name} required>
              <input name="name" value={values.name} onChange={handleChange} className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
            </Form>
            <Form label="SKU" error={errors.sku} required>
              <input name="sku" value={values.sku} onChange={handleChange} className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.sku ? 'border-red-500' : 'border-gray-300'}`} />
            </Form>
            <Form label="Category" error={errors.category}>
              <select name="category" value={values.category} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select category</option>
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Form>
            <Form label="Status" error={errors.status}>
              <select name="status" value={values.status} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Form>
            <Form label="Price" error={errors.price} required>
              <input type="number" name="price" value={values.price} onChange={handleChange} min="0" step="0.01" className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? 'border-red-500' : 'border-gray-300'}`} />
            </Form>
            <Form label="Quantity" error={errors.quantity} required>
              <input type="number" name="quantity" value={values.quantity} onChange={handleChange} min="0" className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`} />
            </Form>
          </div>
          <Form label="Description" error={errors.description}>
            <textarea name="description" value={values.description} onChange={handleChange} rows={2} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </Form>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Saving...' : editItem ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Item" size="sm">
        <p className="text-gray-600 text-sm mb-4">Are you sure you want to delete <strong>{deleteModal?.name}</strong>? This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteModal(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default Items;
