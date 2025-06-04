import React from 'react';
import { Folder } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Group } from '../../types/group';

interface GroupCardProps {
  group: Group;
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/group/${group._id}`);
  };
  
  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-200"
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-blue-50">
          <Folder className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-800">{group.name}</h3>
          {group.description && (
            <p className="text-sm text-gray-500 mt-1">{group.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupCard;