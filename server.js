const express = require("express");
const app = express();
app.get("/", (req,res) => {
  res.sendFile(__dirname + "/index.html");
})
app.get("/:room", (req,res) => {
  res.sendFile(__dirname+"/room.html");
})
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});