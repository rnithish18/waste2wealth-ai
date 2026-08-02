const Transaction = require('../models/Transaction');
const WasteListing = require('../models/WasteListing');
const CarbonSaving = require('../models/CarbonSaving');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

// GET /api/analytics/dashboard  (role-aware: generator sees own stats, buyer sees own, admin sees platform)
exports.getDashboardAnalytics = catchAsync(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const ownerFilter = isAdmin ? {} : { seller: req.user._id };
  const ownerFilterBuyer = isAdmin ? {} : { buyer: req.user._id };

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [revenueTrend, wasteByCategory, carbonAgg, totalListings, totalRevenue, totalCarbon, recentTransactions] =
    await Promise.all([
      Transaction.aggregate([
        { $match: { ...ownerFilter, status: 'completed', createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      WasteListing.aggregate([
        { $match: isAdmin ? {} : { user: req.user._id } },
        { $group: { _id: '$category', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } },
        { $sort: { count: -1 } },
      ]),
      CarbonSaving.aggregate([
        { $match: isAdmin ? {} : { user: req.user._id } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            co2SavedKg: { $sum: '$co2SavedKg' },
            treesEquivalent: { $sum: '$treesEquivalent' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      WasteListing.countDocuments(isAdmin ? {} : { user: req.user._id }),
      Transaction.aggregate([
        { $match: { ...ownerFilter, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      CarbonSaving.aggregate([
        { $match: isAdmin ? {} : { user: req.user._id } },
        { $group: { _id: null, total: { $sum: '$co2SavedKg' } } },
      ]),
      Transaction.find(isAdmin ? {} : { $or: [ownerFilter, ownerFilterBuyer] })
        .sort('-createdAt')
        .limit(5)
        .populate('waste', 'wasteName')
        .populate('seller', 'companyName')
        .populate('buyer', 'companyName'),
    ]);

  const platformStats = isAdmin
    ? {
        totalUsers: await User.countDocuments(),
        totalGenerators: await User.countDocuments({ role: 'generator' }),
        totalBuyers: await User.countDocuments({ role: 'buyer' }),
      }
    : undefined;

  res.status(200).json({
    success: true,
    data: {
      revenueTrend,
      wasteByCategory,
      carbonTrend: carbonAgg,
      totalListings,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalCarbonSavedKg: totalCarbon[0]?.total || 0,
      recentTransactions,
      platformStats,
    },
  });
});
