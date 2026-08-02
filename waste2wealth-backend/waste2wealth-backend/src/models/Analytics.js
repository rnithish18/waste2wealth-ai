const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    scope: { type: String, enum: ['platform', 'user'], default: 'user', index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null when scope=platform

    period: { type: String, required: true }, // "2026-08" (monthly) or "2026-08-02" (daily)
    periodType: { type: String, enum: ['daily', 'monthly', 'yearly'], default: 'monthly' },

    metrics: {
      wasteGeneratedKg: { type: Number, default: 0 },
      wasteSoldKg: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      transactionCount: { type: Number, default: 0 },
      co2SavedKg: { type: Number, default: 0 },
      newListings: { type: Number, default: 0 },
      newUsers: { type: Number, default: 0 },
      topCategories: [{ category: String, count: Number }],
    },
  },
  { timestamps: true }
);

analyticsSchema.index({ scope: 1, user: 1, period: 1, periodType: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
