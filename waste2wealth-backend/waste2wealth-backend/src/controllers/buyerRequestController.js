const BuyerRequest = require('../models/BuyerRequest');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// POST /api/buyer-requests
exports.createBuyerRequest = catchAsync(async (req, res) => {
  const request = await BuyerRequest.create({ ...req.body, buyer: req.user._id });
  res.status(201).json({ success: true, data: { request } });
});

// GET /api/buyer-requests  (mine)
exports.getMyBuyerRequests = catchAsync(async (req, res) => {
  const requests = await BuyerRequest.find({ buyer: req.user._id }).sort('-createdAt');
  res.status(200).json({ success: true, results: requests.length, data: { requests } });
});

// GET /api/buyer-requests/open  (public - generators browse demand)
exports.getOpenRequests = catchAsync(async (req, res) => {
  const { category } = req.query;
  const filter = { status: 'open' };
  if (category) filter.category = category;

  const requests = await BuyerRequest.find(filter).populate('buyer', 'companyName city state').sort('-createdAt');
  res.status(200).json({ success: true, results: requests.length, data: { requests } });
});

// PUT /api/buyer-requests/:id
exports.updateBuyerRequest = catchAsync(async (req, res, next) => {
  const request = await BuyerRequest.findById(req.params.id);
  if (!request) return next(new AppError('Request not found.', 404));
  if (request.buyer.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized.', 403));
  }
  Object.assign(request, req.body);
  await request.save();
  res.status(200).json({ success: true, data: { request } });
});

// DELETE /api/buyer-requests/:id
exports.deleteBuyerRequest = catchAsync(async (req, res, next) => {
  const request = await BuyerRequest.findById(req.params.id);
  if (!request) return next(new AppError('Request not found.', 404));
  if (request.buyer.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized.', 403));
  }
  await request.deleteOne();
  res.status(204).json({ success: true, data: null });
});
