const express = require('express');
const router = express.Router();
const Event = require('../models/Event.js'); // Adjust the path to your models
const Collaborator = require('../models/Collaborator.js'); // Adjust the path to your models

router.post('/api/events/join', async (req, res) => {
    const { name, code } = req.body;
    const userId = req.session.userId; // Assume userId is stored in the session

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
        const event = await Event.findOne({ code });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const collaborator = new Collaborator({
            user: userId,
            event: event._id,
            role: 'Collaborator' // Automatically assign the role of Collaborator
        });

        await collaborator.save();

        // Add the collaborator to the event's collaborators list (if needed)
        event.collaborators.push(collaborator._id);
        await event.save();

        return res.json({ message: 'Successfully joined event' });
    } catch (error) {
        console.error('Error joining event:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;
