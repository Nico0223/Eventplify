const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
var express = require("express");
var app = new express();
const dotenv = require("dotenv");
dotenv.config();
const { OAuth2Client } = require('google-auth-library');
const connectionString = process.env.DATABASE_URL;
const session = require("express-session");
const CLIENT_ID = '743407666242-8l65qg29hsccfd70hee5kb361e2vs0d8.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

const router = express.Router(); //might remove

try {
  mongoose.connect(connectionString);
  console.log("Connected to MongoDB successfully");
} catch (err) {
  console.error(err);
}

const path = require("path"); // our path directory

app.use(express.json()); // use json
app.use(express.urlencoded({ extended: true })); // files consist of more than strings
app.use(express.static("public"));

// Collection Initialization
const User = require("./models/User");
const Event = require("./models/Event");
const Guest = require("./models/Guest");
const Table = require("./models/Table");
const Todo = require("./models/Todo");
const Budget = require("./models/Budget");
const Collaborator = require("./models/Collaborator");

// Routing Initialization
const todoRouter = require("./routes/todoRoute.js");
const userRouter = require("./routes/userRoute.js");
const addEventsRoute = require("./routes/addEventsRoute.js");
const budgetRouter = require("./routes/budgetRoute.js");
const profileRouter = require("./routes/profileRoute.js");
const tableRouter = require("./routes/tableRoute.js");
const chatRouter = require("./routes/chatRoute.js");
const guestRoutes = require("./routes/guestRoutes.js");
const collaboratorsRoutes = require("./routes/collaboratorRoute.js");

app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;

  // Verify the Google ID token
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Replace with your actual Google Client ID
    });
    const payload = ticket.getPayload();
    const googleId = payload['sub'];
    const email = payload['email'];

    // Check if a user with this Google ID already exists
    let user = await User.findOne({ googleId });

    if (user) {
      // User already exists, generate session token and respond
      const sessionToken = 'generated_session_token'; // Replace with actual session token generation
      return res.json({ success: true, token: sessionToken });
    }

    // Check if a user with this email already exists
    user = await User.findOne({ email });

    if (user) {
      // User with this email already exists, handle accordingly
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    // Create a new user since no user found with this Google ID or email
    user = new User({
      googleId,
      email,
      // Add other fields as needed
    });
    await user.save();

    // Generate a session token (you may use JWT for this)
    const sessionToken = 'generated_session_token'; // Replace with actual session token generation

    res.json({ success: true, token: sessionToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});
// POST route to add a collaborator mgiht remove
router.post("/add-collaborator", async (req, res) => {
  try {
    const { name, role, canEditGuest, canEditTodo, canEditBudget } = req.body;

    // Find the user by name
    let user = await User.findOne({ name });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Create a new collaborator
    const newCollaborator = new Collaborator({
      user: user._id,
      role,
      canEditGuest,
      canEditTodo,
      canEditBudget,
    });

    // Save the collaborator to MongoDB
    await newCollaborator.save();

    // Redirect to collaborators.html after successful addition
    res
      .status(201)
      .json({ success: true, message: "Collaborator added successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding the collaborator",
    });
  }
});

module.exports = router; // might remove

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1800000 }, // 30 minutes
  })
);
app.use(async function (req, res, next) {
  if (req.session && req.session.userId) {
    try {
      req.user = await User.findById(req.session.userId);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});
app.get("/events", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(req.session.userId).populate(
      "joinedEvents"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const events = await Event.find({
      $or: [{ owner: req.session.userId }, { _id: { $in: user.joinedEvents } }],
    });

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});
app.get("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).send("Event not found");
    req.session.eventID = event._id;
    res.send(event);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Update event by ID
app.put("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!event) return res.status(404).send("Event not found");
    res.send(event);
  } catch (error) {
    res.status(500).send("Server error");
  }
});
app.delete("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).send("Event not found");
    res.send({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).send("Server error");
  }
});
app.get('/guests/:guestId', async (req, res) => {
  try {
      const guestId = req.params.guestId;
      const guest = await Guest.findById(guestId); // Example using Mongoose

      if (!guest) {
          return res.status(404).json({ error: 'Guest not found' });
      }

      res.json(guest);
  } catch (error) {
      console.error('Error fetching guest:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.put('/guests/:guestId', async (req, res) => {
  const guestId = req.params.guestId;
  const { name, category, status, eventId } = req.body;

  try {
      // Update guest details in MongoDB using Mongoose
      const updatedGuest = await Guest.findByIdAndUpdate(guestId, { name, category, status, eventId }, { new: true });

      if (!updatedGuest) {
          return res.status(404).json({ error: 'Guest not found' });
      }

      res.json(updatedGuest); // Send updated guest details as JSON response
  } catch (error) {
      console.error('Error updating guest:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});
async function deleteGuest(guestId) {
  const result = await Guest.findByIdAndDelete(guestId);
  return result;
}
app.delete('/guests/:guestId', async (req, res) => {
  try {
      const guestId = req.params.guestId;
      
      // Call the deleteGuest function to delete the guest
      await deleteGuest(guestId);
      
      res.status(204).end(); // Successfully deleted
  } catch (error) {
      console.error('Error deleting guest:', error);
      res.status(500).json({ error: 'Failed to delete guest' });
  }
});
// Initializing handlebars
var hbs = require("hbs");
app.set("view engine", "hbs");
hbs.registerPartials(path.join(__dirname, "views", "partials"));

app.use("/", todoRouter);
app.use("/api/users", userRouter);
app.use("/api/events", addEventsRoute);
app.use("/", budgetRouter);
app.use("/", profileRouter);
app.use("/", tableRouter);
app.use("/", chatRouter);
app.use("/guests", guestRoutes);

/* For file uploads */
const fileUpload = require("express-fileupload");
app.use(fileUpload()); //initialize file upload middleware

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home_unlogged.html"));
});

app.get("/event/preview", async (req, res) => {
  const eventId = req.query.eventId;
  const event = await Event.findById(eventId);

  res.render("event_preview", { event });
});

var server = app.listen(port, "0.0.0.0", function () {
  console.log("Node server running at port " + port);
});
