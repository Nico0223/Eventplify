const express = require('express');
const router = express.Router();
const Collaborator = require('../models/Collaborator');
const User = require('../models/User');

// POST route to add a new collaborator
router.post('/add-collaborator', async (req, res) => {
  try {
    const { name, role, canEditGuest, canEditTodo, canEditBudget } = req.body;

    // Find the user by name (assuming this is how you identify users)
    let user = await User.findOne({ name });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Create a new collaborator instance
    const newCollaborator = new Collaborator({
      user: user._id,
      role,
      canEditGuest,
      canEditTodo,
      canEditBudget,
    });

    // Save the collaborator to the database
    await newCollaborator.save();

    // Respond with success message
    res.status(201).json({ success: true, message: 'Collaborator added successfully' });
  } catch (error) {
    console.error('Error:', error);
    // Handle errors and respond with an error message
    res.status(500).json({ success: false, message: 'Failed to add collaborator. Please try again.' });
  }
});

module.exports = router;
