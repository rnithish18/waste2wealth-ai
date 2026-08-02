const Review = require('../models/Review');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// POST /api/reviews
exports.createReview = catchAsync(async (req, res, next) => {
  const { transactionId, rating, comment } = req.body;

  const transaction = await Transaction.findById(transactionId);
  if (!transaction) return next(new AppError('Transaction not found.', 404));
  if (transaction.status !== 'completed') {
    return next(new AppError('You can only review completed transactions.', 400));
  }

  const isParty = [transaction.seller.toString(), transaction.buyer.toString()].includes(req.user._id.toString());
  if (!isParty) return next(new AppError('You are not part of this transaction.', 403));

  const reviewee = transaction.seller.toString() === req.user._id.toString() ? transaction.buyer : transaction.seller;

  const review = await Review.create({
    transaction: transactionId,
    reviewer: req.user._id,
    reviewee,
    rating,
    comment,
  });

  // Recalculate reviewee's aggregate rating
  const stats = await Review.aggregate([
    { $match: { reviewee } },
    { $group: { _id: '$reviewee', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats[0]) {
    await User.findByIdAndUpdate(reviewee, {
      rating: Number(stats[0].avgRating.toFixed(2)),
      ratingCount: stats[0].count,
    });
  }

  res.status(201).json({ success: true, data: { review } });
});

// GET /api/reviews/user/:userId
exports.getUserReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ reviewee: req.params.userId })
    .populate('reviewer', 'companyName avatar')
    .sort('-createdAt');

  res.status(200).json({ success: true, results: reviews.length, data: { reviews } });
});
