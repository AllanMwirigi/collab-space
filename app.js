const http = require('http');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
// parse request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// gzip compress response body
// app.use(compression);

const server = http.createServer(app);
const logger = require('./utils/winston');

const socketio = require('socket.io')(server, {
  cors: {
    // NOTE!!!: in case domain is changed, ensure to replace/update these; local and prod domains
    origin: ["http://localhost:3000", "https://collab-whiteboard.com"],
    // if using socket.io v3, then these two are needed; had to downgrade to v2.3 because ngx-socket-io client in Angular didn't seem to be comaptible, was giving 400 errors
    methods: ["GET", "POST"],
    // credentials: true
  }
});

// sockets for real time data
socketio.on('connection', (socket) => {
  socket.on('join-room', (roomName) => {
    // each user in a workspace will join a room identified by the room name
    socket.join(roomName);
    logger.debug(`socket ${socket.id} joined room ${roomName}`);
  });

  socket.on('whiteboard', (changes) => {
    // send drawn changes to the other user in the workspace room
    const { roomName, type, drawUpdates } = changes;
    socket.to(roomName).emit('whiteboard', { type, drawUpdates });
  });

  socket.on('whiteboard-typing', (data) => {
    const { roomName, changes } = data;
    socket.to(roomName).emit('whiteboard-typing', changes);
  });

});

const PORT = process.env.PORT || 4000; 
server.listen(PORT).on('listening', () => logger.info(`Server listening on port ${PORT}`))
  .on('error', (err) => { logger.error(`Server | ${err.message}`); });
