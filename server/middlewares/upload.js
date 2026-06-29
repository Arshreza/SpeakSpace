import multer from 'multer';
import { resumeStorage, avatarStorage } from '../config/cloudinary.js';
import { AppError } from './errorHandler.js';

const PDF_MIME_TYPES = ['application/pdf'];
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

const MAX_RESUME_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;  // 5MB

// Resume upload configuration (PDF only, 10MB max)
const uploadResume = multer({
  storage: resumeStorage,
  limits: {
    fileSize: MAX_RESUME_SIZE,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (PDF_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only PDF files are allowed for resumes.', 400), false);
    }
  },
}).single('resume');

// Avatar upload configuration (images only, 5MB max)
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: MAX_AVATAR_SIZE,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (IMAGE_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError('Only JPEG, PNG, WebP, and GIF images are allowed for avatars.', 400),
        false
      );
    }
  },
}).single('avatar');

// Audio upload using memory storage (for Whisper transcription)
const audioMemoryStorage = multer.memoryStorage();
const uploadAudio = multer({
  storage: audioMemoryStorage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB — Whisper API limit
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const AUDIO_MIME_TYPES = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/webm',
      'audio/ogg',
      'audio/mp4',
      'audio/m4a',
    ];
    if (AUDIO_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Unsupported audio format.', 400), false);
    }
  },
}).single('audio');

/**
 * Wrap multer middleware to handle errors properly in Express error handler
 */
const wrapMulter = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File size exceeds the allowed limit.', 400));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new AppError('Unexpected file field.', 400));
    }
    next(err);
  });
};

const uploadResumeHandler = wrapMulter(uploadResume);
const uploadAvatarHandler = wrapMulter(uploadAvatar);
const uploadAudioHandler = wrapMulter(uploadAudio);

export {
  uploadResumeHandler as uploadResume,
  uploadAvatarHandler as uploadAvatar,
  uploadAudioHandler as uploadAudio,
};
