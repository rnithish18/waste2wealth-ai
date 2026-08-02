const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// GET /api/notifications
exports.getNotifications = catchAsync(async (req, res) => {
  const { unreadOnly } = req.query;
  const filter = { user: req.user._id };
  if (unreadOnly === 'true') filter.isRead = false;

  const notifications = await Notification.find(filter).sort('-createdAt').limit(100);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

  res.status(200).json({ success: true, results: notifications.length, unreadCount, data: { notifications } });
});

// PATCH /api/notifications/:id/read
exports.markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!notification) return next(new AppError('Notification not found.', 404));

  res.status(200).json({ success: true, data: { notification } });
});

// PATCH /api/notifications/read-all
exports.markAllAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.status(200).json({ success: true, message: 'All notifications marked as read.' });
});

// DELETE /api/notifications/:id
exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!notification) return next(new AppError('Notification not found.', 404));
  res.status(204).json({ success: true, data: null });
});
