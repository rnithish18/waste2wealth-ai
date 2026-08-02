const streamifier = require('stream').PassThrough;
const cloudinary = require('../config/cloudinary');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const streamUpload = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (result) resolve(result);
      else reject(error);
    });
    const bufferStream = new streamifier();
    bufferStream.end(buffer);
    bufferStream.pipe(uploadStream);
  });

// POST /api/uploads  (multipart/form-data, field name: "file", optional "folder")
exports.uploadFile = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError('No file provided.', 400));

  const folder = `waste2wealth/${req.body.folder || 'general'}`;
  const result = await streamUpload(req.file.buffer, folder);

  res.status(201).json({
    success: true,
    data: { url: result.secure_url, publicId: result.public_id },
  });
});

// POST /api/uploads/multiple
exports.uploadMultipleFiles = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next(new AppError('No files provided.', 400));

  const folder = `waste2wealth/${req.body.folder || 'general'}`;
  const results = await Promise.all(req.files.map((f) => streamUpload(f.buffer, folder)));

  res.status(201).json({
    success: true,
    data: { files: results.map((r) => ({ url: r.secure_url, publicId: r.public_id })) },
  });
});
