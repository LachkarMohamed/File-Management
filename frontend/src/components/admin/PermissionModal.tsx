import React, { useState, useEffect } from 'react';
import { User } from '../../types/auth';
import { Group } from '../../types/group';
import { usersApi } from '../../api/users';
import { groupsApi } from '../../api/groups';
import { X } from 'lucide-react';
import Button from '../ui/Button';

interface PermissionModalProps {
  user: User;
  onClose: () => void;
  onSave: () => void;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ user, onClose, onSave }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [permissions, setPermissions] = useState({
    canUpload: user.canUpload,
    canDownload: user.canDownload
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const allGroups = await groupsApi.getGroups();
        setGroups(allGroups);
        
        if (!user?._id) return;

        const userGroups = await usersApi.getUserGroups(user._id);
        setSelectedGroups(userGroups);
      } catch (error) {
        console.error('Failed to load groups:', error);
      }
    };

    loadGroups();
  }, [user]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    if (!user?._id) return;
    
    // Use the dedicated permissions endpoint
    await usersApi.updateUserPermissions(user._id, {
      ...permissions,
      groups: selectedGroups
    });
    onSave();
    onClose();
  } catch (error) {
    console.error('Failed to update permissions:', error);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            User Permissions - {user.username}
          </h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">User Permissions</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={permissions.canUpload}
                  onChange={(e) => setPermissions({ ...permissions, canUpload: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Can Upload</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={permissions.canDownload}
                  onChange={(e) => setPermissions({ ...permissions, canDownload: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Can Download</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Group Memberships</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {groups.map((group) => (
                <label key={group._id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGroups([...selectedGroups, group._id]);
                      } else {
                        setSelectedGroups(selectedGroups.filter(id => id !== group._id));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{group.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PermissionModal;