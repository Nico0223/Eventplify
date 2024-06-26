const Budget = require("../models/Budget");
const Event = require("../models/Event");

exports.addBudget = async (req, res) => {
  const event = req.body.event;
  const itemname = req.body.itemname;
  const itemamount = req.body.itemamount;
  const itemcategory = req.body.itemcategory;

  const newBudget = new Budget({
    event: event,
    name: itemname,
    category: itemcategory,
    amount: itemamount,
  });

  try {
    await newBudget.save();
    res.redirect("/budget?id=" + event);
  } catch (error) {
    console.error("Error saving budget:", error);
    res.status(500).send("Internal Server Error");
  }
  console.log(req.body);
};

exports.editBudget = async (req, res) => {
  const event = req.body.event;
  const itemid = req.body.itemid;
  const itemname = req.body.itemname;
  const itemamount = req.body.itemamount;
  const itemcategory = req.body.itemcategory;

  updatedData = {
    name: itemname,
    amount: itemamount,
    category: itemcategory,
  };

  try {
    const result = await Budget.updateOne({ _id: itemid }, updatedData);
    console.log("Update Result:", result);
    res.redirect("/budget?id=" + event);
    //res.json({ message: "Todo status updated successfully", todo });
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.deleteBudget = async (req, res) => {
  const itemid = req.params.id;
  var budget = await Budget.findById(itemid);

  console.log(itemid);

  try {
    const deletedBudget = await Budget.findByIdAndDelete(itemid);
    if (deletedBudget) {
      res.json({ message: "Todo deleted successfully", deletedBudget });
    } else {
      res.status(404).json({ message: "Todo not found" });
    }
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.editBudgetLimit = async (req, res) => {
  const eventID = req.body.event;
  const itemamount = req.body.itemamount;

  updatedData = {
    budget: itemamount,
  };

  try {
    const result = await Event.updateOne({ _id: eventID }, updatedData);
    console.log("Update Result:", result);
    res.redirect("/budget?id=" + eventID);
    //res.json({ message: "Todo status updated successfully", todo });
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).send("Internal Server Error");
  }
};
