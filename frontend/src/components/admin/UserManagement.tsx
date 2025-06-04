import React, { useState, useEffect } from 'react';
import { User } from '../../types/auth';
import { usersApi } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { MoreVertical, Plus, Search, Pencil, Key, Archive } from 'lucide-react';
import Button from '../ui/Button';
import UserEditModal from './UserEditModal';
import PermissionModal from './PermissionModal';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await usersApi.getUsers();
      let filteredUsers = data;

      // Filter users based on current user's role
      if (currentUser?.role === 'superadmin') {
        // Superadmin sees all users except other superadmins (but includes themselves)
        filteredUsers = data.filter(u => 
          u.role !== 'superadmin' || u._id === currentUser._id
        );
      } else if (currentUser?.role === 'admin') {
        // Admin only sees normal users and themselves
        filteredUsers = data.filter(u => 
          u.role === 'user' || u._id === currentUser._id
        );
      }

      setUsers(filteredUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveUser = async (userId: string) => {
    try {
      await usersApi.archiveUser(userId);
      await loadUsers();
    } catch (error) {
      console.error('Failed to archive user:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canManageUser = (user: User) => {
    if (currentUser?.role === 'superadmin') {
      return true;
    }
    if (currentUser?.role === 'admin') {
      return user.role === 'user';
    }
    return false;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        
        {currentUser?.role === 'superadmin' && (
          <Button
            onClick={() => {
              setSelectedUser(null);
              setShowEditModal(true);
            }}
            icon={<Plus className="h-5 w-5" />}
          >
            Add User
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.canUpload ? 'Upload, ' : ''}{user.canDownload ? 'Download' : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {canManageUser(user) && (
                    <Menu as="div" className="relative inline-block text-left">
                      <MenuButton className="text-gray-400 hover:text-gray-500">
                        <MoreVertical className="h-5 w-5" />
                      </MenuButton>
                      <MenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 focus:outline-none">
                        <MenuItem key="edit">
                          {({ active }) => (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowEditModal(true);
                              }}
                              className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700 w-full text-left`}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </button>
                          )}
                        </MenuItem>
                        {user.role === 'user' && (
                          <MenuItem key="permissions">
                            {({ active }) => (
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowPermissionModal(true);
                                }}
                                className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700 w-full text-left`}
                              >
                                <Key className="h-4 w-4 mr-2" />
                                Permissions
                              </button>
                            )}
                          </MenuItem>
                        )}
                        {user._id !== currentUser?._id && user.role === 'user' && (
                          <MenuItem key="archive">
                            {({ active }) => (
                              <button
                                onClick={() => handleArchiveUser(user._id)}
                                className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-red-600 w-full text-left`}
                              >
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </button>
                            )}
                          </MenuItem>
                        )}
                      </MenuItems>
                    </Menu>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showEditModal && (
        <UserEditModal
          user={selectedUser}
          onClose={() => setShowEditModal(false)}
          onSave={loadUsers}
        />
      )}

      {showPermissionModal && selectedUser && (
        <PermissionModal
          user={selectedUser}
          onClose={() => setShowPermissionModal(false)}
          onSave={loadUsers}
        />
      )}
    </div>
  );
};

export default UserManagement;