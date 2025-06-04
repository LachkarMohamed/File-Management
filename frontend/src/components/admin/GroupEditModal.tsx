import React, { useState, useEffect } from 'react';
import { Group } from '../../types/group';
import { groupsApi } from '../../api/groups';
import { X } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface GroupEditModalProps {
  group: Group | null;
  onClose: () => void;
  onSave: () => void;
}

const GroupEditModal: React.FC<GroupEditModalProps> = ({ group, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name);
    }
  }, [group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (group) {
        await groupsApi.updateGroup(group._id, { name });
      } else {
        await groupsApi.createGroup({ name });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save group:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {group ? 'Edit Group' : 'Add Group'}
          </h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Group Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              {group ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupEditModal;