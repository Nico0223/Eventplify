// Guest.js
const mongoose = require('mongoose');

const GuestSchema = new mongoose.Schema({
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table', // Assuming 'Table' model exists and is correctly referenced
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: false, // Adjust as per your schema
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Not Going', 'Going'], // Assuming these are your valid statuses
  },
});

const Guest = mongoose.model('Guest', GuestSchema);

module.exports = Guest;
