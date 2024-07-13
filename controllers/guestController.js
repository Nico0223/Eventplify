const Guest = require("../models/Guest");
const Event = require("../models/Event");

exports.addGuest = async (req, res) => {
  const event = req.body.event;
  const name = req.body.name;
  const category = req.body.category;
  const status = req.body.status;
  const table = req.body.table; // Assuming table ID is passed from the form, can be null

  const newGuest = new Guest({
    event: event,
    name: name,
    category: category,
    status: status,
    table: table || null, // Allow table to be null if not provided
  });

  try {
    await newGuest.save();
    res.redirect("/guests.html?id=" + event);
  } catch (error) {
    console.error("Error saving guest:", error);
    res.status(500).send("Internal Server Error");
  }
  console.log(req.body);
};
// guestController.js

exports.getGuestsByEventId = async (req, res) => {
  const eventId = req.params.eventId;

  try {
    const guests = await Guest.find({ event: eventId });
    res.json(guests);
  } catch (error) {
    console.error("Error fetching guests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
