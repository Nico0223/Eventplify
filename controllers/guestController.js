// guestController.js
const Guest = require('../models/Guest');
const Table = require('../models/Table');

// guestController.js
async function addGuest(req, res) {
    try {
      const { tableId, name, category, status } = req.body;
  
      // Validate data
      if (!name || !status) {
        return res.status(400).json({ error: 'Name and Status are required fields' });
      }
  
      // Check if tableId is provided and valid
      let table = null;
      if (tableId) {
        table = await Table.findById(tableId);
        if (!table) {
          return res.status(404).json({ error: 'Table not found' });
        }
      }
  
      // Create a new guest
      const newGuest = new Guest({
        table: tableId, // Assign tableId directly if available
        name,
        category,
        status,
      });
  
      // Save the guest to the database
      await newGuest.save();
  
      res.status(201).json(newGuest);
    } catch (err) {
      console.error('Error adding guest:', err);
      res.status(500).json({ error: 'Failed to add guest' });
    }
  }
  
module.exports = {
  addGuest,
};
