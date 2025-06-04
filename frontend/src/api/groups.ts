import { apiClient } from './client';
import { Group } from '../types/group';

interface CreateGroupData {
  name: string;
}

interface UpdateGroupData {
  name: string;
}

export const groupsApi = {
  getGroups: async () => {
    const data = await apiClient.get<any[]>('/users/me/groups');
    return data.map(group => ({
      _id: group._id,
      name: group.name,
      description: group.description,
      createdAt: group.createdAt
    }));
  },

  getGroupMap: async () => {
    const data = await apiClient.get<Group[]>('/groups');
    return {
      nameToId: new Map(data.map(group => [group.name, group._id])),
      idToName: new Map(data.map(group => [group._id, group.name]))
    };
  },

  getGroupById: async (groupId: string) => {
    return apiClient.get<Group>(`/groups/${groupId}`);
  },

  createGroup: (data: CreateGroupData) =>
    apiClient.post<Group>('/groups', data),

  updateGroup: (id: string, data: UpdateGroupData) =>
    apiClient.post<Group>(`/groups/${id}`, data),

  archiveGroup: (id: string) =>
    apiClient.post<Group>(`/groups/${id}/archive`)
};