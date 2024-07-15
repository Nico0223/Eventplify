const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require('../models/User.js');

router.post('/signup', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }
    const existingUsernameUser = await User.findOne({ username });
    if (existingUsernameUser) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      googleId: null, // Initialize as null if not using Google OAuth
      joinedEvents: []
    });

    await newUser.save();

    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/login', async (req, res) => {
  try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
          return res.status(400).json({ error: "Invalid email" });
      }

      const validPass = await bcrypt.compare(req.body.password, user.password);
      if (!validPass) {
          return res.status(400).json({ error: "Invalid password" });
      }
  
      req.session.userId = user._id;
      return res.json({ message: "Login successful" });
  } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: "Something went wrong" });
  }
});
router.get('/is-authenticated', async (req, res) => {
  if (req.session && req.session.userId) {
    const user = await User.findById(req.session.userId);
    res.send({ authenticated: true, user: { email: user.email } });
  } else {
    res.send({ authenticated: false });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send("An error occurred during logout");
    }
    res.clearCookie('accessToken'); 
    res.send({ message: "Logged out!" });
  });
});

module.exports = router;
