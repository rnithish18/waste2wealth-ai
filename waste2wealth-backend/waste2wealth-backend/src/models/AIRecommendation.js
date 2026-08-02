const mongoose = require('mongoose');

const aiRecommendationSchema = new mongoose.Schema(
  {
    waste: { type: mongoose.Schema.Types.ObjectId, ref: 'WasteListing', required: true, index: true },
    recommendedBuyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    matchScore: { type: Number, required: true, min: 0, max: 1 },
    scoreBreakdown: {
      distanceScore: Number,
      historyScore: Number,
      compatibilityScore: Number,
      quantityScore: Number,
      priceScore: Number,
    },
    aiExplanation: String,

    status: { type: String, enum: ['suggested', 'viewed', 'contacted', 'dismissed'], default: 'suggested' },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

aiRecommendationSchema.index({ waste: 1, recommendedBuyer: 1 }, { unique: true });
aiRecommendationSchema.index({ matchScore: -1 });

module.exports = mongoose.model('AIRecommendation', aiRecommendationSchema);
