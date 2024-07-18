const mongoose = require('mongoose');

const CollaboratorSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: String,
    role: {
        type: String,
        enum: ['Owner', 'Collaborator'],
        required: true
    }
});

module.exports = mongoose.model('Collaborator', CollaboratorSchema);
