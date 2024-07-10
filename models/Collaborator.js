const mongoose = require('mongoose');

const CollaboratorSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  role: {
    type: String,
    enum: ['Owner', 'Collaborator'],
    required: true,
  },
  canEditBudget: {
    type: Boolean,
    default: false,
  },
  canEditGuest: {
    type: Boolean,
    default: false,
  },
  canEditTodo: {
    type: Boolean,
    default: false,
  },
});

const Collaborator = mongoose.model('Collaborator', CollaboratorSchema);

module.exports = Collaborator;
