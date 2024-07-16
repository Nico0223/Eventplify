const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  username:  { type: String, unique: true },
  password: String,
  joinedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
