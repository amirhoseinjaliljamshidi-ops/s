const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nationalId: { type: String, unique: true },
  name: String,
  role: { type: String, enum:["student","teacher"] },
  password: String
});

module.exports = mongoose.model("User", userSchema);
