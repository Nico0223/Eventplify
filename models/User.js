const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  username: String,
  password: String,
  googleId: String, // Add Google ID field for OAuth login
  joinedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
