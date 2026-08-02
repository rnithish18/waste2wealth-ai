const mongoose = require('mongoose');

const carbonSavingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    waste: { type: mongoose.Schema.Types.ObjectId, ref: 'WasteListing' },

    co2SavedKg: { type: Number, required: true, default: 0 },
    treesEquivalent: { type: Number, required: true, default: 0 },
    landfillReductionKg: { type: Number, required: true, default: 0 },
    energySavedKwh: { type: Number, required: true, default: 0 },

    period: { type: String }, // e.g. "2026-08" for monthly rollups
  },
  { timestamps: true }
);

carbonSavingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('CarbonSaving', carbonSavingSchema);
