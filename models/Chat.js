const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
  },
  name: String,
  messages: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: String,
      time: String,
      message: String,
    },
  ],
});

const Chat = mongoose.model("Chat", ChatSchema);

module.exports = Chat;
