const Event = require("../models/Event");
const Chat = require("../models/Chat");
const User = require("../models/User");
const bodyParser = require("body-parser");
const { format, utcToZonedTime } = require('date-fns-tz');

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
  const pstTime = utcToZonedTime(now, 'Asia/Manila'); // Convert UTC to Philippine Time

  const formattedTime = format(pstTime, 'yyyy-MM-dd HH:mm:ss');
  return formattedTime;

}
