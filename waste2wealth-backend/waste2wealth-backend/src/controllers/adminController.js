const User = require('../models/User');
const WasteListing = require('../models/WasteListing');
const ComplianceDocument = require('../models/ComplianceDocument');
const Transaction = require('../models/Transaction');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// GET /api/admin/users
exports.getAllUsers = catchAsync(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.companyName = new RegExp(search, 'i');

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, results: users.length, total, page: Number(page), data: { users } });
});

// PATCH /api/admin/users/:id/status
exports.updateUserStatus = catchAsync(async (req, res, next) => {
  const { isActive, isApproved } = req.body;
  const update = {};
  if (isActive !== undefined) update.isActive = isActive;
  if (isApproved !== undefined) update.isApproved = isApproved;

  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!user) return next(new AppError('User not found.', 404));

  res.status(200).json({ success: true, data: { user } });
});

// GET /api/admin/waste
exports.getAllListingsAdmin = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [waste, total] = await Promise.all([
    WasteListing.find(filter).populate('user', 'companyName email').sort('-createdAt').skip(skip).limit(Number(limit)),
    WasteListing.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, results: waste.length, total, page: Number(page), data: { waste } });
});

// PATCH /api/admin/waste/:id/approve
exports.approveListing = catchAsync(async (req, res, next) => {
  const { status } = req.body; // 'active' | 'rejected'
  if (!['active', 'rejected'].includes(status)) return next(new AppError('status must be active or rejected.', 400));

  const waste = await WasteListing.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!waste) return next(new AppError('Waste listing not found.', 404));

  res.status(200).json({ success: true, data: { waste } });
});

// GET /api/admin/compliance-documents
exports.getComplianceDocuments = catchAsync(async (req, res) => {
  const { status = 'pending' } = req.query;
  const docs = await ComplianceDocument.find({ status }).populate('user', 'companyName email').sort('-createdAt');
  res.status(200).json({ success: true, results: docs.length, data: { documents: docs } });
});

// PATCH /api/admin/compliance-documents/:id
exports.reviewComplianceDocument = catchAsync(async (req, res, next) => {
  const { status, reviewNotes } = req.body;
  if (!['approved', 'rejected'].includes(status)) return next(new AppError('status must be approved or rejected.', 400));

  const doc = await ComplianceDocument.findByIdAndUpdate(
    req.params.id,
    { status, reviewNotes, reviewedBy: req.user._id },
    { new: true }
  );
  if (!doc) return next(new AppError('Document not found.', 404));

  res.status(200).json({ success: true, data: { document: doc } });
});

// GET /api/admin/platform-stats
exports.getPlatformStats = catchAsync(async (req, res) => {
  const [totalUsers, totalGenerators, totalBuyers, totalListings, totalTransactions, revenueAgg] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'generator' }),
    User.countDocuments({ role: 'buyer' }),
    WasteListing.countDocuments(),
    Transaction.countDocuments({ status: 'completed' }),
    Transaction.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers, totalGenerators, totalBuyers, totalListings, totalTransactions,
      totalRevenue: revenueAgg[0]?.total || 0,
    },
  });
});
