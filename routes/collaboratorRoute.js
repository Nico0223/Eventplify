const express = require('express');
const router = express.Router();
const Collaborator = require('../models/Collaborator');
const User = require('../models/User');

router.post('/add-collaborator', async (req, res) => {
  try {
    const { name, role, canEditGuest, canEditTodo, canEditBudget } = req.body;

    let user = await User.findOne({ name });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const collaborator = new Collaborator({
      user: user._id,
      role,
      canEditGuest,
      canEditTodo,
      canEditBudget,
    });

    await collaborator.save();

    res.status(201).json({ success: true, collaborator });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'An error occurred while adding the collaborator' });
  }
});

module.exports = router;
