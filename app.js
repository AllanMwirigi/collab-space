const http = require('http');
const cors = require('cors');
const express = require('express');

const app = express();
app.use(cors());

const server = http.createServer(app);
const logger = require('./utils/winston');

const socketio = require('socket.io')(server, {
  cors: {
    // NOTE!!!: in case domain is changed, ensure to replace/update these; local and prod domains
    origin: ["http://localhost:3000", "https://collab-whiteboard.com"],
    // if using socket.io v3, then these two are needed; had to downgrade to v2.3 because ngx-socket-io client in Angular didn't seem to be comaptible, was giving 400 errors
    methods: ["GET", "POST"],
    credentials: true
  }
});

// sockets for real time data
socketio.on('connection', (socket) => {
  socket.on('join-room', (roomName) => {
    // each user in a meeting will join a room identified by the room name
    socket.join(roomName);
  });

  socket.on('whiteboard', (data) => {
    // send drawn changes to the other user in the meeting room
    const { roomName, changes } = data;
    socket.to(roomName).emit('whiteboard', changes);
  });

  socket.on('whiteboard-typing', (data) => {
    const { roomName, changes } = data;
    socket.to(roomName).emit('whiteboard-typing', changes);
  });

});

const PORT = process.env.PORT || 4000; 
server.listen(PORT).on('listening', () => logger.info(`Server listening on port ${PORT}`))
  .on('error', (err) => { logger.error(`Server | ${err.message}`); });
