const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  category: { type: String, enum: ['Electricity','Natural Gas','Transportation','Other'], required: true },
  notes:    { type: String, default: '' },
  date:     { type: Date, required: true },

  amount:   { type: Number },

  transportMode: { 
    type: String, 
    enum: ['car','bus','train','subway','rideshare','bike','walk','e-scooter','other'], 
  },

  transportDistance: { type: Number }, // miles
  electricityCategory: {
    type: String,
    enum: ['light', 'device'],
  },
  electricityDuration: { type: Number }, // hours
  naturalGasCategory: {
    type: String,
    enum: ['heating', 'water_heating', 'cooking'],
  },
  naturalGasDuration: { type: Number }, // hours
}, { timestamps: true });

module.exports = mongoose.model('Log', logSchema);
