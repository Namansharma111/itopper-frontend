import axios from 'axios';
import { getApiUrl } from '../config/api';

const API_BASE = getApiUrl('/api/blogs');

// Ensure we have a valid JWT admin token for database operations
const ensureAdminToken = async () => {
  let token = localStorage.getItem("token");
  if (token) return token;

  try {
    const res = await axios.post(getApiUrl('/api/auth/admin-login'), {
      email: import.meta.env.VITE_ADMIN_EMAIL || "itopper@gmail.com",
      password: import.meta.env.VITE_ADMIN_PASSWORD || "itopper@1230"
    });
    if (res.data && res.data.token) {
      localStorage.setItem("token", res.data.token);
      return res.data.token;
    }
  } catch (e) {
    console.error("Failed to auto-fetch admin token:", e);
  }
  return null;
};

const getAuthHeader = async () => {
  const token = await ensureAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch all blogs directly from Backend Database API
export const getBlogs = async () => {
  try {
    const res = await axios.get(API_BASE);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error('Error fetching blogs from API:', err);
    return [];
  }
};

// Fetch single blog directly from Backend Database API
export const getBlogById = async (id) => {
  try {
    const res = await axios.get(`${API_BASE}/${encodeURIComponent(id)}`);
    return res.data;
  } catch (err) {
    console.error(`Error fetching blog ${id} from API:`, err);
    return null;
  }
};

// Add blog directly to Backend Database API (with automatic token refresh & retry on 401)
export const addBlog = async (blog) => {
  let headers = await getAuthHeader();
  try {
    const res = await axios.post(API_BASE, blog, { headers });
    return res.data;
  } catch (err) {
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      // Token expired: force refresh and retry once
      localStorage.removeItem("token");
      headers = await getAuthHeader();
      const retryRes = await axios.post(API_BASE, blog, { headers });
      return retryRes.data;
    }
    console.error('Error creating blog via API:', err);
    throw err;
  }
};

// Update blog directly in Backend Database API
export const updateBlog = async (id, updatedBlog) => {
  let headers = await getAuthHeader();
  try {
    const res = await axios.put(`${API_BASE}/${encodeURIComponent(id)}`, updatedBlog, { headers });
    return res.data;
  } catch (err) {
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      localStorage.removeItem("token");
      headers = await getAuthHeader();
      const retryRes = await axios.put(`${API_BASE}/${encodeURIComponent(id)}`, updatedBlog, { headers });
      return retryRes.data;
    }
    console.error(`Error updating blog ${id} via API:`, err);
    throw err;
  }
};

// Delete blog directly from Backend Database API
export const deleteBlog = async (id) => {
  let headers = await getAuthHeader();
  try {
    const res = await axios.delete(`${API_BASE}/${encodeURIComponent(id)}`, { headers });
    return res.data;
  } catch (err) {
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      localStorage.removeItem("token");
      headers = await getAuthHeader();
      const retryRes = await axios.delete(`${API_BASE}/${encodeURIComponent(id)}`, { headers });
      return retryRes.data;
    }
    console.error(`Error deleting blog ${id} via API:`, err);
    throw err;
  }
};
