const mongoose = require('mongoose');

const buyerRequestSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    materialType: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    quantityNeeded: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, enum: ['kg', 'ton', 'litre', 'piece', 'cubic_meter'] },
    maxBudget: { type: Number, min: 0 },
    preferredQualityGrade: { type: String, enum: ['A', 'B', 'C', 'Any'], default: 'Any' },
    requiredByDate: Date,
    notes: String,
    status: { type: String, enum: ['open', 'fulfilled', 'cancelled'], default: 'open' },
  },
  { timestamps: true }
);

buyerRequestSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model('BuyerRequest', buyerRequestSchema);
