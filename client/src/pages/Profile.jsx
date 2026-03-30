import React, { useState, useContext } from 'react';
import useAuth from '../hooks/useAuth';
import { AppContext } from '../context/AppContext';
import api from '../services/api';
import Form from '../components/Form';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useContext(AppContext);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    setProfileErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword(prev => ({ ...prev, [name]: value }));
    setPasswordErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!profile.name) errors.name = 'Name is required';
    if (Object.keys(errors).length > 0) { setProfileErrors(errors); return; }
    setSavingProfile(true);
    try {
      await api.put('/auth/profile', profile);
      updateUser({ ...user, ...profile });
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!password.currentPassword) errors.currentPassword = 'Current password is required';
    if (!password.newPassword || password.newPassword.length < 6) errors.newPassword = 'New password must be at least 6 characters';
    if (password.newPassword !== password.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (Object.keys(errors).length > 0) { setPasswordErrors(errors); return; }
    setSavingPassword(true);
    try {
      await api.put('/auth/password', { currentPassword: password.currentPassword, newPassword: password.newPassword });
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      {/* User Info Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-blue-100 text-blue-700 rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user?.name || 'User'}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full capitalize font-medium">{user?.role || 'user'}</span>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} noValidate>
          <h3 className="text-base font-semibold text-gray-900 mb-4">Edit Profile</h3>
          <Form label="Full Name" error={profileErrors.name} required>
            <input
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${profileErrors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
          </Form>
          <Form label="Phone" error={profileErrors.phone}>
            <input
              name="phone"
              value={profile.phone}
              onChange={handleProfileChange}
              placeholder="+1 (555) 000-0000"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form>
          <Form label="Address" error={profileErrors.address}>
            <textarea
              name="address"
              value={profile.address}
              onChange={handleProfileChange}
              rows={2}
              placeholder="Your address..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form>
          <div className="flex justify-end">
            <button type="submit" disabled={savingProfile} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Change Password</h3>
        <form onSubmit={handlePasswordSubmit} noValidate>
          <Form label="Current Password" error={passwordErrors.currentPassword} required>
            <input
              type="password"
              name="currentPassword"
              value={password.currentPassword}
              onChange={handlePasswordChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'}`}
            />
          </Form>
          <Form label="New Password" error={passwordErrors.newPassword} required>
            <input
              type="password"
              name="newPassword"
              value={password.newPassword}
              onChange={handlePasswordChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
            />
          </Form>
          <Form label="Confirm New Password" error={passwordErrors.confirmPassword} required>
            <input
              type="password"
              name="confirmPassword"
              value={password.confirmPassword}
              onChange={handlePasswordChange}
              className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
            />
          </Form>
          <div className="flex justify-end">
            <button type="submit" disabled={savingPassword} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {savingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
