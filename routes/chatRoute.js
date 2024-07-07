const { Router } = require("express");
const hbs = require("hbs");
const chatController = require("../controllers/chatController");
const Event = require("../models/Event");
const Chat = require("../models/Chat");
const User = require("../models/User");
const router = Router();
const { format, parse } = require("date-fns");

router.get("/chat", async (req, res) => {
  var eventID = req.query.id || "667bd17dbf98e4a49621ddef"; // Can be modified if the base events module is created
  var event = await Event.findById(eventID);

  var chat = await Chat.findOne({ event: eventID });
  if (chat == null) {
    var newChat = new Chat({
      event: eventID,
      name: event.name,
    });

    try {
      await newChat.save();
    } catch (error) {
      console.error("Error saving chat:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  if (chat.messages.length > 0) {
    chat.messages.forEach((message) => {
      var messageOwner = message.user.toString();
      if (messageOwner == req.session.userId.toString()) {
        message.type = "sent";
        message.name = null;
      } else {
        message.type = "received";
      }
    });
  }

  console.log(chat.messages);
  res.render("chat_message", { chat, id: eventID });
});

router.post("/postMessage", chatController.addMessage);

module.exports = router;
