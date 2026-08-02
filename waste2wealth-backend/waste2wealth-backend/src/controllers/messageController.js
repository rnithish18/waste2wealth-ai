const Message = require('../models/Message');
const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const buildConversationId = (a, b) => [a.toString(), b.toString()].sort().join('_');

// POST /api/messages
exports.sendMessage = catchAsync(async (req, res, next) => {
  const { receiverId, text, wasteId, attachments } = req.body;
  if (!receiverId || !text) return next(new AppError('receiverId and text are required.', 400));

  const conversationId = buildConversationId(req.user._id, receiverId);

  const message = await Message.create({
    conversationId,
    sender: req.user._id,
    receiver: receiverId,
    waste: wasteId,
    text,
    attachments,
  });

  await Notification.create({
    user: receiverId,
    type: 'new_message',
    title: 'New message',
    message: `${req.user.companyName} sent you a message.`,
    relatedId: message._id,
    relatedModel: 'Message',
  });

  // If Socket.IO is attached to the app, emit in real time to the receiver's room
  const io = req.app.get('io');
  if (io) io.to(receiverId.toString()).emit('new_message', message);

  res.status(201).json({ success: true, data: { message } });
});

// GET /api/messages/:userId  (conversation thread with a specific user)
exports.getConversation = catchAsync(async (req, res) => {
  const conversationId = buildConversationId(req.user._id, req.params.userId);

  const messages = await Message.find({ conversationId }).sort('createdAt');

  await Message.updateMany(
    { conversationId, receiver: req.user._id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({ success: true, results: messages.length, data: { messages } });
});

// GET /api/messages  (list of conversations with last message preview)
exports.getConversationsList = catchAsync(async (req, res) => {
  const messages = await Message.aggregate([
    { $match: { $or: [{ sender: req.user._id }, { receiver: req.user._id }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [{ $and: [{ $eq: ['$receiver', req.user._id] }, { $eq: ['$isRead', false] }] }, 1, 0],
          },
        },
      },
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
  ]);

  res.status(200).json({ success: true, results: messages.length, data: { conversations: messages } });
});
