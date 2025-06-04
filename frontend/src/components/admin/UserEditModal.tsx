import React, { useState, useEffect } from 'react';
import { User } from '../../types/auth';
import { usersApi } from '../../api/users';
import { X } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

interface UserEditModalProps {
  user: User | null;
  onClose: () => void;
  onSave: () => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, onClose, onSave }) => {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        password: '',
        role: user.role
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        // Only send password if it was changed
        const updateData = {
          username: formData.username,
          role: formData.role,
          ...(formData.password ? { password: formData.password } : {})
        };
        await usersApi.updateUser(user._id, updateData);
      } else {
        await usersApi.createUser({
          ...formData,
          groups: [],
          canUpload: true,
          canDownload: true
        });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save user:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableRoles = currentUser?.role === 'superadmin' 
    ? ['user', 'admin', 'superadmin']
    : ['user'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {user ? 'Edit User' : 'Add User'}
          </h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!user}
          />

          {currentUser?.role === 'superadmin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                {availableRoles.map(role => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              {user ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;