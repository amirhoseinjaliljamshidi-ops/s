const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const lessonRoutes = require("./routes/lessons");

const app = express();
app.use(cors());
app.use(express.json());

// اتصال به MongoDB
mongoose.connect("mongodb://localhost:27017/schooldb", { useNewUrlParser:true, useUnifiedTopology:true })
  .then(()=>console.log("MongoDB connected"))
  .catch(err=>console.log(err));

app.use("/api/auth", authRoutes);
app.use("/api/lessons", lessonRoutes);

app.listen(5000, ()=>console.log("Server running on port 5000"));
