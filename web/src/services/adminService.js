import { api } from './api.js';

export const adminService = {
  async summary() {
    const { data } = await api.get('/api/dashboard/summary');
    return data.data ?? data;
  },
  async userStats() {
    const { data } = await api.get('/api/dashboard/users');
    return data.data ?? data;
  },
  async categoryStats() {
    const { data } = await api.get('/api/dashboard/categories');
    return data.data ?? data;
  },
  async artisanStats() {
    const { data } = await api.get('/api/dashboard/artisans');
    return data.data ?? data;
  },
  async requestStats() {
    const { data } = await api.get('/api/dashboard/service-requests');
    return data.data ?? data;
  },
  async assignmentStats() {
    const { data } = await api.get('/api/dashboard/assignments');
    return data.data ?? data;
  },
  async reviewStats() {
    const { data } = await api.get('/api/dashboard/reviews');
    return data.data ?? data;
  },
  async notificationStats() {
    const { data } = await api.get('/api/dashboard/notifications');
    return data.data ?? data;
  },
  async monthly(months = 7) {
    const { data } = await api.get('/api/dashboard/monthly', { params: { months } });
    return data.data ?? data;
  },
  async topArtisans() {
    const { data } = await api.get('/api/dashboard/top-artisans');
    return data;
  },
  async topCategories() {
    const { data } = await api.get('/api/dashboard/top-categories');
    return data;
  },

  async users(params = {}) {
    const { data } = await api.get('/api/users', { params });
    return data;
  },
  async updateUserStatus(id, status) {
    const { data } = await api.patch(`/api/users/${id}/status`, { status });
    return data.data;
  },

  async artisans(params = {}) {
    const { data } = await api.get('/api/artisans', { params });
    return data;
  },
  async verifyArtisan(id, verified = true) {
    const { data } = await api.patch(`/api/artisans/${id}/verify`, { verified });
    return data.data;
  },

  async categories(params = {}) {
    const { data } = await api.get('/api/categories', { params });
    return data;
  },
  async createCategory(payload) {
    const { data } = await api.post('/api/categories', payload);
    return data.data;
  },

  async serviceRequests(params = {}) {
    const { data } = await api.get('/api/service-requests', { params });
    return data;
  },

  async reviews(params = {}) {
    const { data } = await api.get('/api/reviews', { params });
    return data;
  },
};
