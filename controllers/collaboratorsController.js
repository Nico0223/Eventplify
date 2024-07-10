const Collaborator = require("../models/Collaborator");
const Event = require("../models/Event");
const User = require("../models/User");

exports.addCollaborator = async (req, res) => {
  try {
    const { eventId, userId, role, canEditBudget, canEditGuest, canEditTodo } = req.body;

    const newCollaborator = new Collaborator({
      event: eventId,
      user: userId,
      role,
      canEditBudget: role === "Co-Owner" ? true : canEditBudget,
      canEditGuest: role === "Co-Owner" ? true : canEditGuest,
      canEditTodo: role === "Co-Owner" ? true : canEditTodo,
    });

    await newCollaborator.save();

    const event = await Event.findById(eventId);
    event.collaborators.push(newCollaborator._id);
    await event.save();

    res.status(201).json({ message: "Collaborator added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCollaborators = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const collaborators = await Collaborator.find({ event: eventId }).populate('user', 'name email');

    res.json(collaborators);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
