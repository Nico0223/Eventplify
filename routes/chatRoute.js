const { Router } = require("express");
const hbs = require("hbs");
const chatController = require("../controllers/chatController");
const Event = require("../models/Event");
const Chat = require("../models/Chat");
const User = require("../models/User");
const router = Router();
const { format, parse } = require("date-fns");
const mongoose = require("mongoose");

/*
router.get("/chat", async (req, res) => {
  var eventID = req.query.id || "668fb9c72ba117bfd45576d8"; // Can be modified if the base events module is created
  var chat = await Chat.find({ event: eventID });

  chat.forEach((item) => {
    var messageCtr = item.messages.length;
    item.last = item.messages[messageCtr - 1].message;
    if (req.session.userId == item.messages[messageCtr - 1].user) {
      item.lastUser = "You";
    } else {
      item.lastUser = item.messages[messageCtr - 1].name;
    }
    console.log(item);
  });

  console.log(chat);

  res.render("chat", {
    chat,
    id: eventID,
  });
});

router.get("/addChat", async (req, res) => {
  var eventID = req.session.eventID || "668fb9c72ba117bfd45576d8"; // Can be modified if the base events module is created

  res.render("chat_add");
});

router.get("/messages", async (req, res) => {
  try {
    const chatID = req.query.id; // Can be modified if the base events module is created

    // Validate chatID
    if (!mongoose.Types.ObjectId.isValid(chatID)) {
      console.error("Invalid chat ID:", chatID);
      return res.status(400).send("Invalid chat ID.");
    }

    console.log("Valid chat ID received:", chatID);

    const chat = await Chat.findById(chatID);

    if (!chat) {
      console.error("Chat not found for ID:", chatID);
      return res.status(404).send("Chat not found.");
    }

    console.log("Chat found:", chat);

    if (chat.messages.length > 0) {
      chat.messages.forEach((message) => {
        if (message.user) {
          const messageOwner = message.user.toString();
          if (messageOwner === req.session.userId?.toString()) {
            message.type = "sent";
            message.name = null;
          } else {
            message.type = "received";
          }
        }
      });
    }

    console.log("Processed messages:", chat.messages);
    res.render("chat_message", { chat });
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).send("Internal Server Error");
  }
});*/

router.get("/chat", async (req, res) => {
  var eventID = req.query.id || req.session.eventID;
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

  if (chat.messages != null) {
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

router.post("/submitAddChat", chatController.addChat);
router.post("/postMessage", chatController.addMessage);

module.exports = router;
