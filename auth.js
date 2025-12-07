const router = require("express").Router();
const User = require("../models/User");

// Login
router.post("/login", async (req,res)=>{
  const { nationalId, password } = req.body;
  const user = await User.findOne({ nationalId, password });
  if(!user) return res.status(401).json({msg:"Invalid credentials"});
  res.json({id:user._id, name:user.name, role:user.role});
});

module.exports = router;
