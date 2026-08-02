const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    waste: { type: mongoose.Schema.Types.ObjectId, ref: 'WasteListing', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    pricePerUnit: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_transit', 'delivered', 'completed', 'cancelled', 'disputed'],
      default: 'pending',
    },

    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
    paymentMethod: { type: String, enum: ['cod', 'online', 'bank_transfer'], default: 'cod' },

    pickupAddress: String,
    deliveryAddress: String,
    scheduledPickupDate: Date,
    deliveredAt: Date,

    carbonSaved: {
      co2SavedKg: Number,
      treesEquivalent: Number,
    },

    cancelReason: String,
  },
  { timestamps: true }
);

transactionSchema.index({ seller: 1, status: 1 });
transactionSchema.index({ buyer: 1, status: 1 });
transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
