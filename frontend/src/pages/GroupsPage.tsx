import React, { useEffect, useState } from 'react';
import GroupCard from '../components/groups/GroupCard';
import { Group } from '../types/group';
import { groupsApi } from '../api/groups';
import { Loader2 } from 'lucide-react';

const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await groupsApi.getGroups();
        setGroups(data);
      } catch (err) {
        setError('Failed to load groups. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="mt-4 text-gray-600">Loading groups...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="p-6 bg-red-50 rounded-lg inline-block">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Groups</h1>
      
      {groups.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No groups found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard key={group._id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupsPage;