const path = require('path');
const fs = require('fs');

/**
 * Upload image file to storage (Cloudinary if configured, local static folder fallback)
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} Image URL
 */
const uploadImage = async (file) => {
  const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
  const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret) {
    try {
      const cloudinary = require('cloudinary').v2;
      cloudinary.config({
        cloud_name: cloudinaryCloudName,
        api_key: cloudinaryApiKey,
        api_secret: cloudinaryApiSecret
      });

      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'nutrilens_meals',
        resource_type: 'image'
      });

      // Remove local temp file after Cloudinary upload
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return result.secure_url;
    } catch (err) {
      console.warn('[Cloudinary Upload Warning] Falling back to local storage:', err.message);
    }
  }

  // Local static file URL fallback
  const filename = path.basename(file.path);
  const baseUrl = process.env.APP_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${filename}`;
};

module.exports = {
  uploadImage
};
