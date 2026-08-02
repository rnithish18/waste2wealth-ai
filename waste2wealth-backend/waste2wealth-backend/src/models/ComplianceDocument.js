const mongoose = require('mongoose');

const complianceDocumentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    waste: { type: mongoose.Schema.Types.ObjectId, ref: 'WasteListing' },

    documentType: {
      type: String,
      required: true,
      enum: ['GST_Certificate', 'Pollution_Control_Board_License', 'Hazardous_Waste_Authorization', 'Other'],
    },
    documentUrl: { type: String, required: true },
    documentNumber: String,
    issuedBy: String,
    issueDate: Date,
    expiryDate: Date,

    status: { type: String, enum: ['pending', 'approved', 'rejected', 'expired'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewNotes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('ComplianceDocument', complianceDocumentSchema);
