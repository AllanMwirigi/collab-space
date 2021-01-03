"use strict";

const logger = require('./utils/winston');

const workspaces = {};

exports.initSync = (server) => {
  const socketio = require('socket.io')(server, {
    cors: {
      // NOTE!!!: in case domain is changed, ensure to replace/update these; local and prod domains
      origin: ["http://localhost:3000"],
      // if using socket.io v3, then these two are needed; had to downgrade to v2.3 because ngx-socket-io client in Angular didn't seem to be comaptible, was giving 400 errors
      methods: ["GET", "POST"],
      // credentials: true
    }
  });
  
  // sockets for real time data
  socketio.on('connection', (socket) => {
    socket.on('join-room', ({ roomName, userName }) => {
      // each user in a workspace will join a room identified by the room name
      // create a new entry in workspaces if none exists
      if (workspaces[roomName] == null) {
        workspaces[roomName] = {
          drawMode: true,
          isDrawing: false,
          // currentPaths: new _immutable.List(),
          currentPaths: [],
          canvasColor: "white",
          strokeColor: "red",
          strokeWidth: 4,
          eraserWidth: 20,
        }
      }
      socket.join(roomName);
      logger.debug(`socket ${socket.id} joined room ${roomName}`);
      socket.to(roomName).emit('join-room', userName);
      socketio.to(roomName).emit('whiteboard-paths', { 
        currentPaths: workspaces[roomName].currentPaths,
        isDrawing: workspaces[roomName].isDrawing
      });
    });
  
    socket.on('chat-msg', (data) => {
      const { roomName, txt, senderName } = data;
      socket.to(roomName).emit('chat-msg', { txt, senderName });
    });

    // Pointer down event
    socket.on("sketchPointerDown", function ({ roomName, point }) {
      // logger.debug(`pointerDown ${JSON.stringify(point)}`)
      if (workspaces[roomName] == null) {
        workspaces[roomName] = {
          drawMode: true,
          isDrawing: false,
          currentPaths: [],
          canvasColor: "white",
          strokeColor: "red",
          strokeWidth: 4,
          eraserWidth: 20,
        }
      }
      workspaces[roomName].isDrawing = true;
      const { drawMode, strokeColor, canvasColor, strokeWidth, eraserWidth } = workspaces[roomName];
      const cp = workspaces[roomName].currentPaths.slice();
      cp.push({
        drawMode: drawMode,
        strokeColor: drawMode ? strokeColor : canvasColor,
        strokeWidth: drawMode ? strokeWidth : eraserWidth,
        paths: [point]
      });
      workspaces[roomName].currentPaths = cp;

      socketio.to(roomName).emit('whiteboard-paths', { 
        currentPaths: workspaces[roomName].currentPaths,
        isDrawing: workspaces[roomName].isDrawing
      });
    });

    // Pointer move event
    socket.on("sketchPointerMove", function ({ roomName, point }) {
      // logger.debug(`pointerMove ${JSON.stringify(point)}`)
      if (workspaces[roomName] == null) {
        workspaces[roomName] = {
          drawMode: true,
          isDrawing: false,
          currentPaths: [],
          canvasColor: "white",
          strokeColor: "red",
          strokeWidth: 4,
          eraserWidth: 20,
        }
      }
      if (!workspaces[roomName].isDrawing) return;

      const cp = workspaces[roomName].currentPaths.slice();
      cp[workspaces[roomName].currentPaths.length - 1].paths.push(point);
      workspaces[roomName].currentPaths = cp;

      socketio.to(roomName).emit('whiteboard-paths', { 
        currentPaths: workspaces[roomName].currentPaths,
        isDrawing: workspaces[roomName].isDrawing
      });
    });

    // Pointer up event
    socket.on("sketchPointerUp", function ({roomName}) {
      if (workspaces[roomName] == null) {
        workspaces[roomName] = {
          drawMode: true,
          isDrawing: false,
          currentPaths: [],
          canvasColor: "white",
          strokeColor: "red",
          strokeWidth: 4,
          eraserWidth: 20,
        }
      }
      workspaces[roomName].isDrawing = false;
    });

  
  });
}