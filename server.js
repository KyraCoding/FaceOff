const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

const socket = require("socket.io");

const io = socket(server, {
  /* options */
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get("/:room", (req, res) => {
  res.sendFile(__dirname + "/room.html");
});

io.use((socket, next) => {
  const url = new URL(socket.handshake.headers.referer);
  const path = url.pathname;
  console.log(io.sockets.adapter.rooms)
  /*
  if (io.sockets.adapter.rooms.get(url.pathname) ? io.sockets.adapter.rooms.get(url.pathname).size : 0 > 1) {
    next(new Error("Room full!"));
    console.log("user rejected due to full room")
  } else {
    next()
  }
  */
  socket.join(path)
});

io.on("connection", (socket) => {
  console.log(socket.id + " just joined!");
  socket.on("disconect", () => {
    console.log(socket.id + " just left!");
  });
});

server.listen(process.env.PORT, () => {
  console.log("server up!");
});
