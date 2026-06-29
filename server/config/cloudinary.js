import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import logger from '../utils/logger.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Verify cloudinary config
const verifyCloudinaryConfig = async () => {
  try {
    await cloudinary.api.ping();
    logger.info('Cloudinary connection verified');
  } catch (error) {
    logger.error(`Cloudinary configuration error: ${error.message}`);
  }
};

if (process.env.CLOUDINARY_CLOUD_NAME) {
  verifyCloudinaryConfig();
}

// Storage for resumes (PDFs)
const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'speckspace/resumes',
    allowed_formats: ['pdf'],
    resource_type: 'raw',
    use_filename: true,
    unique_filename: true,
    transformation: [],
  },
});

// Storage for avatars (images)
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'speckspace/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    resource_type: 'image',
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
    use_filename: false,
    unique_filename: true,
  },
});

// Storage for audio recordings
const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'speckspace/audio',
    allowed_formats: ['mp3', 'wav', 'webm', 'ogg', 'm4a'],
    resource_type: 'video',
    use_filename: false,
    unique_filename: true,
  },
});

/**
 * Delete a file from Cloudinary by public ID
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    logger.error(`Cloudinary delete error for "${publicId}": ${error.message}`);
    throw error;
  }
};

/**
 * Upload a buffer directly to Cloudinary
 */
const uploadBuffer = async (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    uploadStream.end(buffer);
  });
};

export {
  cloudinary,
  resumeStorage,
  avatarStorage,
  audioStorage,
  deleteFromCloudinary,
  uploadBuffer,
};
export default cloudinary;
