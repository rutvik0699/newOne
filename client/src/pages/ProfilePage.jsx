import React, { useState, useContext } from 'react';
import api from '../services/api';
import { ENDPOINTS } from '../constants/api';
import { AppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import Input from '../components/Input';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useContext(AppContext);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put(ENDPOINTS.AUTH.PROFILE, form);
      updateUser({ ...user, ...data.data });
      showSuccess('Profile updated successfully');
      setEditing(false);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account information</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
              {user?.role}
            </span>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" name="name" value={form.name} onChange={handleChange} required />
            <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
            <Input label="Address" name="address" value={form.address} onChange={handleChange} />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={() => setEditing(false)}>Cancel</Button>
              <Button type="submit" loading={loading}>Save Changes</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Name</p>
                <p className="font-medium mt-1">{user?.name || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium mt-1">{user?.email || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <p className="font-medium mt-1">{user?.phone || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Address</p>
                <p className="font-medium mt-1">{user?.address || '—'}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setEditing(true)}>Edit Profile</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
