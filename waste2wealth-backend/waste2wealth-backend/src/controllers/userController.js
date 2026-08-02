const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// GET /api/users/profile
exports.getProfile = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
});

// PUT /api/users/profile
exports.updateProfile = catchAsync(async (req, res, next) => {
  const disallowed = ['password', 'role', 'email', 'isEmailVerified', 'isApproved', 'isActive'];
  disallowed.forEach((field) => delete req.body[field]);

  if (req.body.latitude && req.body.longitude) {
    req.body.location = { type: 'Point', coordinates: [req.body.longitude, req.body.latitude] };
  }

  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: { user } });
});

// GET /api/users/:id  (public profile view - e.g. viewing a seller's storefront)
exports.getPublicProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select(
    'companyName industryType city state rating ratingCount avatar createdAt'
  );
  if (!user) return next(new AppError('User not found.', 404));

  res.status(200).json({ success: true, data: { user } });
});

// GET /api/users/nearby?lat=&lng=&maxDistanceKm=
exports.getNearbyIndustries = catchAsync(async (req, res, next) => {
  const { lat, lng, maxDistanceKm = 100, role } = req.query;
  if (!lat || !lng) return next(new AppError('lat and lng query params are required.', 400));

  const filter = {
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
        $maxDistance: Number(maxDistanceKm) * 1000,
      },
    },
    isActive: true,
  };
  if (role) filter.role = role;

  const users = await User.find(filter)
    .select('companyName industryType city state location rating avatar')
    .limit(50);

  res.status(200).json({ success: true, results: users.length, data: { users } });
});
