const mongoose = require('mongoose');

const wasteListingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    wasteName: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Metal', 'Plastic', 'Paper', 'Textile', 'Chemical', 'Wood',
        'Glass', 'Rubber', 'E-Waste', 'Organic', 'Construction', 'Other',
      ],
    },
    materialType: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, enum: ['kg', 'ton', 'litre', 'piece', 'cubic_meter'] },

    qualityGrade: { type: String, enum: ['A', 'B', 'C', 'Unrated'], default: 'Unrated' },
    moisturePercentage: { type: Number, min: 0, max: 100, default: 0 },
    hazardous: { type: Boolean, default: false },

    images: [{ type: String }],

    price: { type: Number, required: true, min: 0 },
    priceUnit: { type: String, default: 'per_unit' },
    negotiable: { type: Boolean, default: true },

    availability: { type: Boolean, default: true },
    pickupLocation: {
      address: String,
      city: String,
      state: String,
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
      },
    },

    status: {
      type: String,
      enum: ['pending_review', 'active', 'sold', 'inactive', 'rejected'],
      default: 'active',
    },

    // ---- AI-generated fields (populated by /api/ai/classify) ----
    aiClassification: {
      predictedCategory: String,
      recyclability: { type: String, enum: ['High', 'Medium', 'Low', 'Unknown'], default: 'Unknown' },
      hazardLevel: { type: String, enum: ['None', 'Low', 'Medium', 'High', 'Unknown'], default: 'Unknown' },
      confidence: { type: Number, min: 0, max: 1 },
      classifiedAt: Date,
    },
    aiPricePrediction: {
      suggestedPrice: Number,
      priceRangeLow: Number,
      priceRangeHigh: Number,
      reasoning: String,
      predictedAt: Date,
    },
    carbonImpact: {
      co2SavedKg: Number,
      treesEquivalent: Number,
      landfillReductionKg: Number,
      energySavedKwh: Number,
    },

    views: { type: Number, default: 0 },
    savedByCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

wasteListingSchema.index({ 'pickupLocation.location': '2dsphere' });
wasteListingSchema.index({ category: 1, status: 1 });
wasteListingSchema.index({ wasteName: 'text', description: 'text', materialType: 'text' });
wasteListingSchema.index({ price: 1 });
wasteListingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('WasteListing', wasteListingSchema);
