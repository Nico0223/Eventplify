const Event = require("../models/Event");
const Chat = require("../models/Chat");
const User = require("../models/User");

exports.addMessage = async (req, res) => {
  const chatID = req.body.id || "66851b210012c41e9ad23dfb";
  const message = req.body.message;
  const user = "6670e38a9dc29d82305a675f";
  const name = "pok";
  const newMessage = {
    message: message,
    name: name,
    time: getCurrentTimeFormatted(),
    user: user,
  };

  try {
    // Find the chat document by its ID
    const chat = await Chat.findById(chatID);

    if (!chat) {
      console.log("Chat not found");
      return;
    }

    // Add the new message to the messages array
    chat.messages.push(newMessage);

    // Save the updated chat document back to the database
    await chat.save();

    console.log("Message added successfully");
  } catch (err) {
    console.error("Error adding message:", err);
  }
};

function getCurrentTimeFormatted() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
