import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import UserManagement from '../components/admin/UserManagement';
import GroupManagement from '../components/admin/GroupManagement';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  
  // Redirect if not admin/superadmin
  if (!user || !['admin', 'superadmin'].includes(user.role)) {
    return <Navigate to="/" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Management</h1>
        <p className="text-gray-600 mt-1"><br /> </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="groups">
          <GroupManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;