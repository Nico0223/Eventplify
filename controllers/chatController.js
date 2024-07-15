
const Event = require("../models/Event");
const Chat = require("../models/Chat");
const User = require("../models/User");
const bodyParser = require("body-parser");



exports.addChat = async (req, res) => {
  const { chatname, members } = req.body;
  // `members` will be an array of selected member IDs
  console.log("Chat Name:", chatname);
  console.log("Selected Members:", members);
};

exports.addMessage = async (req, res) => {
  const chatID = req.body.id || "66851b210012c41e9ad23dfb";
  const message = req.body.message_input;
  const userID = req.session.userId;
  const user = await User.findById(userID);
  const username = user.username;

  const newMessage = {
    message: message,
    name: username,
    time: getCurrentTimeFormatted(),
    user: userID,
  };
  console.log("chat user:" + user);
  console.log("username: " + username);
  console.log(newMessage);
  try {
    // Find the chat document by its ID
    const chat = await Chat.findById(chatID);

    if (!chat) {
      console.log("Chat not found");
      return res.status(404).send("Chat not found");
    }

    if (username == null || userID == null) {
      return res.redirect("/chat?id=" + chat.event);
    }

    // Add the new message to the messages array
    chat.messages.push(newMessage);

    // Save the updated chat document back to the database
    await chat.save();

    console.log("Message added successfully");
    return res.redirect("/chat?id=" + chat.event);
  } catch (err) {
    console.error("Error adding message:", err);
    return res.redirect("/chat?id=" + req.session.eventID);
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