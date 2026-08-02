const Transaction = require('../models/Transaction');
const WasteListing = require('../models/WasteListing');
const CarbonSaving = require('../models/CarbonSaving');
const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// POST /api/transactions
exports.createTransaction = catchAsync(async (req, res, next) => {
  const { wasteId, quantity, pickupAddress, deliveryAddress, paymentMethod } = req.body;

  const waste = await WasteListing.findById(wasteId);
  if (!waste) return next(new AppError('Waste listing not found.', 404));
  if (!waste.availability || waste.status !== 'active') {
    return next(new AppError('This listing is not currently available.', 400));
  }
  if (quantity > waste.quantity) {
    return next(new AppError('Requested quantity exceeds available quantity.', 400));
  }

  const totalAmount = Number((quantity * waste.price).toFixed(2));

  const transaction = await Transaction.create({
    waste: waste._id,
    seller: waste.user,
    buyer: req.user._id,
    quantity,
    unit: waste.unit,
    pricePerUnit: waste.price,
    totalAmount,
    pickupAddress: pickupAddress || waste.pickupLocation?.address,
    deliveryAddress,
    paymentMethod,
  });

  await Notification.create({
    user: waste.user,
    type: 'order_update',
    title: 'New order received',
    message: `${req.user.companyName} placed an order for ${quantity} ${waste.unit} of ${waste.wasteName}.`,
    relatedId: transaction._id,
    relatedModel: 'Transaction',
  });

  res.status(201).json({ success: true, data: { transaction } });
});

// GET /api/transactions  (role-aware: seller sees their sales, buyer sees their orders)
exports.getMyTransactions = catchAsync(async (req, res) => {
  const filter = req.user.role === 'buyer' ? { buyer: req.user._id } : { seller: req.user._id };
  const transactions = await Transaction.find(filter)
    .populate('waste', 'wasteName category images')
    .populate('seller', 'companyName city')
    .populate('buyer', 'companyName city')
    .sort('-createdAt');

  res.status(200).json({ success: true, results: transactions.length, data: { transactions } });
});

// GET /api/transactions/:id
exports.getTransactionById = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('waste')
    .populate('seller', 'companyName city phone email')
    .populate('buyer', 'companyName city phone email');

  if (!transaction) return next(new AppError('Transaction not found.', 404));

  const isParty = [transaction.seller._id.toString(), transaction.buyer._id.toString()].includes(req.user._id.toString());
  if (!isParty && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to view this transaction.', 403));
  }

  res.status(200).json({ success: true, data: { transaction } });
});

// PATCH /api/transactions/:id/status
exports.updateTransactionStatus = catchAsync(async (req, res, next) => {
  const { status, cancelReason } = req.body;
  const validStatuses = ['pending', 'confirmed', 'in_transit', 'delivered', 'completed', 'cancelled', 'disputed'];
  if (!validStatuses.includes(status)) return next(new AppError('Invalid status value.', 400));

  const transaction = await Transaction.findById(req.params.id).populate('waste');
  if (!transaction) return next(new AppError('Transaction not found.', 404));

  const isParty = [transaction.seller.toString(), transaction.buyer.toString()].includes(req.user._id.toString());
  if (!isParty && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to update this transaction.', 403));
  }

  transaction.status = status;
  if (status === 'cancelled') transaction.cancelReason = cancelReason;
  if (status === 'delivered') transaction.deliveredAt = new Date();

  if (status === 'completed') {
    // Deduct sold quantity, mark listing sold if fully depleted
    const waste = await WasteListing.findById(transaction.waste._id);
    waste.quantity = Math.max(0, waste.quantity - transaction.quantity);
    if (waste.quantity === 0) { waste.status = 'sold'; waste.availability = false; }
    await waste.save({ validateBeforeSave: false });

    if (waste.carbonImpact?.co2SavedKg) {
      const ratio = transaction.quantity / (transaction.quantity + waste.quantity || 1);
      await CarbonSaving.create({
        user: transaction.seller,
        transaction: transaction._id,
        waste: waste._id,
        co2SavedKg: Number((waste.carbonImpact.co2SavedKg * ratio).toFixed(2)),
        treesEquivalent: Number(((waste.carbonImpact.treesEquivalent || 0) * ratio).toFixed(2)),
        landfillReductionKg: Number(((waste.carbonImpact.landfillReductionKg || 0) * ratio).toFixed(2)),
        energySavedKwh: Number(((waste.carbonImpact.energySavedKwh || 0) * ratio).toFixed(2)),
        period: new Date().toISOString().slice(0, 7),
      });
    }
  }

  await transaction.save();

  const notifyUserId = req.user._id.toString() === transaction.seller.toString() ? transaction.buyer : transaction.seller;
  await Notification.create({
    user: notifyUserId,
    type: 'order_update',
    title: 'Order status updated',
    message: `Order status changed to "${status}".`,
    relatedId: transaction._id,
    relatedModel: 'Transaction',
  });

  res.status(200).json({ success: true, data: { transaction } });
});
