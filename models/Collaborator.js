const mongoose = require("mongoose");

const CollaboratorSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  role: String,
  canEditBudget: Boolean,
  canEditGuest: Boolean,
  canEditTodo: Boolean,
});

const Collaborator = mongoose.model("Collaborator", CollaboratorSchema);

module.exports = Collaborator;
