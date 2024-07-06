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
    res.redirect("/guests?id=" + event);
  } catch (error) {
    console.error("Error saving guest:", error);
    res.status(500).send("Internal Server Error");
  }
  console.log(req.body);
};
