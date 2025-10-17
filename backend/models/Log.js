const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  category: { type: String, enum: ['Electricity','Natural Gas','Transportation','Other'], required: true },
  notes:    { type: String, default: '' },
  date:     { type: Date, required: true },

  amount:   { type: Number, default: null },

  transportMode: { 
  type: String, 
  enum: ['car','bus','train','subway','rideshare','bike','walk','e-scooter','other'], 
  default: null 
},

  transportDistance: { type: Number, default: null }, // kilometers or miles (your choice)
}, { timestamps: true });

module.exports = mongoose.model('Log', logSchema);
