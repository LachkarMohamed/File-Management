import React, { useState, useEffect } from 'react';
import { Group } from '../../types/group';
import { groupsApi } from '../../api/groups';
import { MoreVertical, Plus, Search, Pencil, Archive } from 'lucide-react';
import Button from '../ui/Button';
import GroupEditModal from './GroupEditModal';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

const GroupManagement: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await groupsApi.getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveGroup = async (groupId: string) => {
    try {
      await groupsApi.archiveGroup(groupId);
      await loadGroups();
    } catch (error) {
      console.error('Failed to archive group:', error);
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search groups..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        
        <Button
          onClick={() => {
            setSelectedGroup(null);
            setShowEditModal(true);
          }}
          icon={<Plus className="h-5 w-5" />}
        >
          Add Group
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredGroups.map((group) => (
              <tr key={group._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{group.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(group.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Menu as="div" className="relative inline-block text-left">
                    <MenuButton className="text-gray-400 hover:text-gray-500">
                      <MoreVertical className="h-5 w-5" />
                    </MenuButton>
                    <MenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 focus:outline-none">
                      <MenuItem>
                        {({ active }) => (
                          <button
                            onClick={() => {
                              setSelectedGroup(group);
                              setShowEditModal(true);
                            }}
                            className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700 w-full text-left`}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </button>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ active }) => (
                          <button
                            onClick={() => handleArchiveGroup(group._id)}
                            className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-red-600 w-full text-left`}
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </button>
                        )}
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showEditModal && (
        <GroupEditModal
          group={selectedGroup}
          onClose={() => setShowEditModal(false)}
          onSave={loadGroups}
        />
      )}
    </div>
  );
};

export default GroupManagement;