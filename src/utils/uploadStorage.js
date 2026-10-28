import { getApiUrl } from '../config/api';

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

    const res = await fetch(UPLOAD_API, {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.url) {
        console.log('✅ File uploaded successfully to Cloudinary:', data.url);
        return data.url;
      }
    }
  } catch (err) {
    console.error('❌ Cloudinary upload failed:', err.message);
    throw new Error(`Image upload failed: ${err.message}`);
  }
};
