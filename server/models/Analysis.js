const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  language: { type: String, required: true },
  complexity: { type: String },
  energyScore: { type: Number },
  sustainabilityScore: { type: Number },
  co2Grams: { type: Number },
  detections: [{ type: String }],
  rating: { type: String }
}, { timestamps: true }); // timestamps: true automatically handles `createdAt`

module.exports = mongoose.model('Analysis', analysisSchema);