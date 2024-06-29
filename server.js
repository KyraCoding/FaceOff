const express = require("express");
const WebSocket = require('ws');
const app = express();



app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});


const server = app.listen(process.env.PORT, () => {
  console.log("Server up! :>")
});
const wss = new WebSocket.Server({ server });
wss.on('connection', function(socket,request,pathname) {
  console.log("connected to one from ")
});