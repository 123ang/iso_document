import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API Methods
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
};

export const documentSetsAPI = {
  getAll: () => api.get('/document-sets'),
  getMy: () => api.get('/document-sets/my'),
  getOne: (id: number) => api.get(`/document-sets/${id}`),
  create: (data: any) => api.post('/document-sets', data),
  update: (id: number, data: any) => api.patch(`/document-sets/${id}`, data),
  delete: (id: number) => api.delete(`/document-sets/${id}`),
};

export const documentsAPI = {
  getAll: () => api.get('/documents'),
  getOne: (id: number) => api.get(`/documents/${id}`),
  getByDocumentSet: (setId: number) => api.get(`/documents/document-set/${setId}`),
  search: (query: string) => api.get(`/documents/search?q=${query}`),
  create: (data: any) => api.post('/documents', data),
  update: (id: number, data: any) => api.patch(`/documents/${id}`, data),
  delete: (id: number) => api.delete(`/documents/${id}`),
  setCurrentVersion: (id: number, versionId: number) =>
    api.post(`/documents/${id}/set-current-version`, { versionId }),
};

export const versionsAPI = {
  getAll: () => api.get('/versions'),
  getOne: (id: number) => api.get(`/versions/${id}`),
  getByDocument: (documentId: number) => api.get(`/versions/document/${documentId}`),
  upload: (data: FormData) => api.post('/versions/upload', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  setAsCurrent: (id: number) => api.post(`/versions/${id}/set-current`),
  download: async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${api.defaults.baseURL}/versions/${id}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = `document-${id}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  },
  getViewUrl: async (id: number): Promise<string> => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${api.defaults.baseURL}/versions/${id}/view`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      // Create blob URL for viewing
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      return window.URL.createObjectURL(blob);
    } catch (error) {
      console.error('View error:', error);
      throw error;
    }
  },
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  getOne: (id: number) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: number, data: any) => api.patch(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
  assignGroups: (id: number, groupIds: number[]) =>
    api.post(`/users/${id}/groups`, { groupIds }),
};

export const groupsAPI = {
  getAll: () => api.get('/groups'),
  getOne: (id: number) => api.get(`/groups/${id}`),
  create: (data: any) => api.post('/groups', data),
  update: (id: number, data: any) => api.patch(`/groups/${id}`, data),
  delete: (id: number) => api.delete(`/groups/${id}`),
};

export const auditAPI = {
  getAll: (params?: any) => api.get('/audit', { params }),
  getByEntity: (type: string, id: number) => api.get(`/audit/entity/${type}/${id}`),
};
