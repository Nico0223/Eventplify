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
router.delete('/api/collaborators/:collaboratorId', async (req, res) => {
    try {
        const { collaboratorId } = req.params;
        const { eventId } = req.query;

        if (!eventId) {
            return res.status(400).json({ error: 'eventId query parameter is required' });
        }

        // Ensure IDs are ObjectId types
        const collaboratorObjectId = mongoose.Types.ObjectId(collaboratorId);
        const eventObjectId = mongoose.Types.ObjectId(eventId);

        // Find and delete the collaborator
        const collaborator = await Collaborator.findById(collaboratorObjectId);

        if (!collaborator) {
            return res.status(404).json({ error: 'Collaborator not found' });
        }

        // Remove the collaborator from the event's participants list by name
        const eventUpdateResult = await Event.updateOne(
            { _id: eventObjectId },
            { $pull: { participants: { name: collaborator.name } } }
        );

        if (eventUpdateResult.modifiedCount === 0) {
            return res.status(404).json({ error: 'Event not found or collaborator not in event\'s participants list' });
        }

        // Optionally, remove the collaborator document
        await Collaborator.findByIdAndDelete(collaboratorObjectId);

        // Check if the user being removed is the logged-in user
        const loggedInUserId = req.user ? req.user._id : null; // Adjust based on your auth setup

        if (collaborator.user.toString() === loggedInUserId?.toString()) {
            // Optionally: Remove the logged-in user from the event's participants list
            await Event.updateOne(
                { _id: eventObjectId },
                { $pull: { participants: { name: collaborator.name } } }
            );
        }

        res.status(204).end(); // Successfully deleted
    } catch (error) {
        console.error('Error deleting collaborator:', error);
        res.status(500).json({ error: 'Failed to delete collaborator' });
    }
});


module.exports = router;
