import { getApiUrl } from '../config/api';
import axios from 'axios';

const UPLOAD_API = getApiUrl('/api/upload');

/**
 * Upload a File (PDF or Image) to Cloudinary via backend API
 * @param {File} file - The file object from <input type="file" />
 * @param {string} folder - Optional folder name in Cloudinary (default 'itopper_docs')
 * @returns {Promise<string>} The Cloudinary HTTPS URL
 */
export const uploadFileToCloudinary = async (file, folder = 'itopper_docs') => {
  if (!file) return '';

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const isPrelims = ['prelims_images', 'prelims_brochures', 'prelims_faculty'].includes(folder);
    if (isPrelims) {
      const { data } = await axios.post(UPLOAD_API, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
      if (!data?.url || !/^https:\/\//i.test(data.url)) throw new Error('Upload did not return a secure file URL. Please try again.');
      return data.url;
    }
    const res = await fetch(UPLOAD_API, {
      method: 'POST',
      body: formData
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `File upload failed (${res.status}). Please try again.`);
    if (!data.url || !/^https:\/\//i.test(data.url)) throw new Error('Upload did not return a secure file URL. Please try again.');
    return data.url;
  } catch (err) {
    console.error('❌ Cloudinary upload failed:', err.message);
    throw new Error(err.response?.data?.message || err.message || 'File upload failed. Please try again.');
  }
};
