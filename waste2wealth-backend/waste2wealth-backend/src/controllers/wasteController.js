const WasteListing = require('../models/WasteListing');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// POST /api/waste
exports.createWaste = catchAsync(async (req, res, next) => {
  const payload = { ...req.body, user: req.user._id };

  if (req.body.pickupLatitude && req.body.pickupLongitude) {
    payload.pickupLocation = {
      address: req.body.pickupAddress,
      city: req.body.pickupCity,
      state: req.body.pickupState,
      location: {
        type: 'Point',
        coordinates: [req.body.pickupLongitude, req.body.pickupLatitude],
      },
    };
  }

  const waste = await WasteListing.create(payload);
  res.status(201).json({ success: true, data: { waste } });
});

// GET /api/waste  (listings belonging to the logged-in generator)
exports.getMyWaste = catchAsync(async (req, res) => {
  const waste = await WasteListing.find({ user: req.user._id }).sort('-createdAt');
  res.status(200).json({ success: true, results: waste.length, data: { waste } });
});

// GET /api/waste/:id
exports.getWasteById = catchAsync(async (req, res, next) => {
  const waste = await WasteListing.findById(req.params.id).populate(
    'user',
    'companyName industryType city state rating ratingCount avatar phone email'
  );
  if (!waste) return next(new AppError('Waste listing not found.', 404));

  waste.views += 1;
  await waste.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, data: { waste } });
});

// PUT /api/waste/:id
exports.updateWaste = catchAsync(async (req, res, next) => {
  const waste = await WasteListing.findById(req.params.id);
  if (!waste) return next(new AppError('Waste listing not found.', 404));

  if (waste.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to modify this listing.', 403));
  }

  Object.assign(waste, req.body);
  await waste.save();

  res.status(200).json({ success: true, data: { waste } });
});

// DELETE /api/waste/:id
exports.deleteWaste = catchAsync(async (req, res, next) => {
  const waste = await WasteListing.findById(req.params.id);
  if (!waste) return next(new AppError('Waste listing not found.', 404));

  if (waste.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to delete this listing.', 403));
  }

  await waste.deleteOne();
  res.status(204).json({ success: true, data: null });
});

// GET /api/marketplace  (public search/filter/sort)
exports.getMarketplace = catchAsync(async (req, res) => {
  const {
    search, category, materialType, minPrice, maxPrice,
    minQuantity, city, state, qualityGrade, hazardous,
    sortBy = '-createdAt', page = 1, limit = 12,
  } = req.query;

  const filter = { status: 'active', availability: true };

  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (materialType) filter.materialType = new RegExp(materialType, 'i');
  if (city) filter['pickupLocation.city'] = new RegExp(city, 'i');
  if (state) filter['pickupLocation.state'] = new RegExp(state, 'i');
  if (qualityGrade) filter.qualityGrade = qualityGrade;
  if (hazardous !== undefined) filter.hazardous = hazardous === 'true';
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (minQuantity) filter.quantity = { $gte: Number(minQuantity) };

  const skip = (Number(page) - 1) * Number(limit);

  const [waste, total] = await Promise.all([
    WasteListing.find(filter)
      .populate('user', 'companyName city state rating avatar')
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit)),
    WasteListing.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    results: waste.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    data: { waste },
  });
});
