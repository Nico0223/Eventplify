// controllers/eventController.js

const Event = require("../models/Event");
const User = require("../models/User"); // Ensure this line is at the top of the file
const Collaborator = require("../models/Collaborator.js"); // Adjust the path to your models

// Function to generate a unique 5-digit code
const generateUniqueCode = async () => {
  let code;
  let isUnique = false;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  while (!isUnique) {
    code = "";
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const existingEvent = await Event.findOne({ code });

    if (!existingEvent) {
      isUnique = true; // Code is unique if no event with this code exists
    }
  }

  return code;
};
exports.addEvent = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, description, date, startTime, endTime, location } = req.body;

    const code = await generateUniqueCode(); // Generate the unique 5-digit code

    const newEvent = new Event({
      owner: req.session.userId,
      name,
      description,
      date,
      startTime,
      endTime,
      location,
      code,
      participants: [],
      budget: 10000,
    });

    await newEvent.save();

    const owner = await User.findById(req.session.userId);
    if (!owner) {
      throw new Error("Owner not found");
    }

    console.log("Owner Username: ", owner.username);

    const collaborator = new Collaborator({
      user: req.session.userId,
      event: newEvent._id,
      name: owner.username,
      role: "Owner",
    });
    await collaborator.save();
    return res
      .status(200)
      .json({ message: "Event added successfully", event: newEvent });
  } catch (error) {
    console.error("Error adding event:", error);
    return res.status(500).json({
      error: "An error occurred while adding the event. Please try again.",
    });
  }
};

exports.getEvents = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const events = await Event.find({ owner: req.session.userId });

    return res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching events" });
  }
};

exports.joinEvent = async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      console.error("Name or code missing in request body");
      return res.status(400).json({ error: "Name and code are required" });
    }

    const event = await Event.findOne({ code });
    if (!event) {
      console.error("Event not found with code:", code);
      return res.status(404).json({ error: "Event not found" });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      console.error("User not found with ID:", req.session.userId);
      return res.status(404).json({ error: "User not found" });
    }

    const isParticipant = event.participants.some((participant) => {
      if (!participant.userId) {
        console.error(
          "Participant without userId found in event:",
          event._id,
          participant
        );
        return false;
      }
      return participant.userId.equals(user._id);
    });

    if (!isParticipant) {
      console.log("User is not a participant, adding to event:", event._id);
      event.participants.push({ userId: user._id, name });
      await event.save();
      console.log("User added to event participants:", event.participants);
    } else {
      console.log("User is already a participant in the event:", event._id);
    }

    if (!user.joinedEvents.includes(event._id)) {
      console.log("Event not in user's joinedEvents, adding event:", event._id);
      user.joinedEvents.push(event._id);
      await user.save();
      console.log("Event added to user's joinedEvents:", user.joinedEvents);
    } else {
      console.log("Event already in user's joinedEvents:", event._id);
    }

    // Add the user to the Collaborator database
    const existingCollaborator = await Collaborator.findOne({
      user: user._id,
      event: event._id,
    });
    if (!existingCollaborator) {
      const collaborator = new Collaborator({
        user: user._id,
        event: event._id,
        name: name,
        role: "Collaborator",
      });
      await collaborator.save();
      console.log(
        "User added to Collaborators with role 'Collaborator':",
        collaborator
      );
    } else {
      console.log("User is already a collaborator for the event:", event._id);
    }

    return res
      .status(200)
      .json({ message: "Joined event successfully", event });
  } catch (error) {
    console.error("Error joining event:", error);
    return res.status(500).json({
      error: "An error occurred while joining the event. Please try again.",
    });
  }
};

exports.leaveEvent = async (req, res) => {
  const userId = req.session.userId;
  const eventId = req.params.eventId; // Extract eventId from URL parameter

  if (!userId || !eventId) {
    return res.status(400).json({ error: "User ID or Event ID is missing" });
  }

  try {
    // Remove event from user's joined events
    await User.findByIdAndUpdate(userId, {
      $pull: { joinedEvents: eventId },
    });

    // Remove user from event's participants
    await Event.findByIdAndUpdate(eventId, {
      $pull: { participants: { userId: userId } },
    });

    // Optionally, remove the user from Collaborators if needed
    await Collaborator.findOneAndDelete({ user: userId, event: eventId });

    res.json({ message: "Successfully left the event" });
  } catch (error) {
    console.error("Error leaving event:", error);
    res.status(500).json({ error: "Failed to leave the event" });
  }
};
