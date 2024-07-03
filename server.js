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

// Radians to Degrees
function toDegrees(angle) {
  return angle * (180 / Math.PI);
}

// Degrees to Radians
function toRadians(angle) {
  return (angle * Math.PI) / 180;
}
// Caclulate bearing
function calculateBearing(lat1, long1, lat2, long2) {
  var lat1 = toRadians(lat1);
  var long1 = toRadians(long1);
  var lat2 = toRadians(lat2);
  var long2 = toRadians(long2);

  var dLon = long2 - long1;

  var y = Math.sin(dLon) * Math.cos(lat2);
  var x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  var brng = Math.atan2(y, x);

  brng = toDegrees(brng);
  brng = (brng + 360) % 360;

  return brng;
}

wss.on("connection", function (socket, request, pathname) {
  console.log("New socket!");
  socket.on("message", function (msg) {
    msg = JSON.parse(msg);

    if (msg.room) {
      // Check if user is already in room and room is not full
      if (!socket.room) {
        // If no room exists, create it
        if (!rooms.get(msg.room)) {
          rooms.set(msg.room, new Map());
          console.log(`New room \"${msg.room}\" added!`);
        }

        var room = rooms.get(msg.room);
        if (room.size <2 ) {
          
        
        room.set(socket, { position: {} });
        rooms.set(msg.room, room);
        socket.room = msg.room;
        console.log(`New user added to room \"${msg.room}\"`);
        socket.send(JSON.stringify({ success: true }));
        } else {
          socket.send(JSON.stringify({ success: false, error: "Room full!" }));
        }
      } else {
        socket.send(JSON.stringify({ success: false, error: "User already in room!" }));
      }
    }
    if (msg.position) {
      if (socket.room) {
        var room = rooms.get(socket.room);
        var user = room.get(socket);
        user.position = msg.position;
        room.set(socket, user);
        rooms.set(socket.room, room);

        if (room.size == 2) {
          // :3
          var partner_socket = Array.from(room.keys())[
            (Array.from(room.keys()).indexOf(socket) + 1) % 2
          ];
          var partner = room.get(partner_socket);

          if (
            !!user.position?.latitude &&
            !!user.position?.longitude &&
            !!partner.position?.latitude &&
            !!partner.position?.longitude
          ) {
            partner_socket.send(
              JSON.stringify({
                bearing: calculateBearing(
                  partner.position.latitude,
                  partner.position.longitude,
                  user.position.latitude,
                  user.position.longitude
                ),
              })
            );
          }
        }
      }
    }
  });
  socket.onclose = function (event) {
    var socket = event.target;
    console.log("socket closed :<");
    if (socket.room) {
      var room = rooms.get(socket.room);
      room.delete(socket);
      console.log(`Removing user from room \"${socket.room}\"...`);
      if (rooms.get(socket.room).size <= 0) {
        rooms.delete(socket.room);
        console.log(
          `Room \"${socket.room}\" has no users remaining and has been Sacrificed. There are now ${rooms.size} rooms remaining.`
        );
      }
    }
  };
});
