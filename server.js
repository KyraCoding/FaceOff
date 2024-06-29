const express = require("express");
const WebSocket = require("ws");
const app = express();

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const server = app.listen(process.env.PORT, () => {
  console.log("Server up! :>");
});
const wss = new WebSocket.Server({ server });

var rooms = new Map();

wss.on("connection", function (socket, request, pathname) {
  
  console.log("New socket!");
  socket.on("message", function(msg) {
    msg = JSON.parse(msg)
    
    if (msg.room) {
      // No room exists, create it
      if (!rooms.get(msg.room)) {
        rooms.set(msg.room, new Map());
        console.log(`New room \"${msg.room}\" added!`)
      }
      
      // Check if user is already in room and room is not full
      if (!socket.room && rooms.get(msg.room).size < 2) {
        var room = rooms.get(msg.room)
        room.set(socket, {position:{}})
        rooms.set(msg.room, room);
        socket.room = msg.room
        console.log(`New user added to room \"${msg.room}\"`)
        socket.send(JSON.stringify({success: true}))
      } else {
        console.log(socket.room)
        console.log(rooms.get(msg.room).size)
        socket.send(JSON.stringify({success: false}))
      }
      
    }
    if (msg.position) {
      if (socket.room) {
        var room = rooms.get(socket.room) 
        var user = room.get(socket)
        user.position = msg.position
        room.set(socket, user)
        rooms.set(socket.room, room)
        
        if (room.size == 2) {
          // :3
          var partner = Array.from(room.entries())[(Array.from(room.entries()).indexOf(user)+1)%2]
        }
      }
    }
  });
});
