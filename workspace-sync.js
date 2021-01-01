"use strict";

const _immutable = require("immutable");
const logger = require('./utils/winston');

const defaultCanvasData = {
  drawMode: true,
  isDrawing: false,
  currentPaths: new _immutable.List(),
  canvasColor: "white",
  strokeColor: "red",
  strokeWidth: 4,
  eraserWidth: 20,
}
const workspaces = {};


exports.initSync = (server) => {
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
    socket.on('join-room', ({ roomName, userName }) => {
      // each user in a workspace will join a room identified by the room name
      // create a new entry in workspaces if none exists
      if (workspaces[roomName] == null) {
        workspaces[roomName] = {
          drawMode: true,
          isDrawing: false,
          currentPaths: new _immutable.List(),
          canvasColor: "white",
          strokeColor: "red",
          strokeWidth: 4,
          eraserWidth: 20,
        }
      }
      socket.join(roomName);
      logger.debug(`socket ${socket.id} joined room ${roomName}`);
      socket.to(roomName).emit('join-room', userName);
      socket.to(roomName).emit('whiteboard-paths', { 
        currentPaths: workspaces[roomName].currentPaths,
        isDrawing: workspaces[roomName].isDrawing
      });
    });
  
    // socket.on('whiteboard-paths', (data) => {
    //   // send drawn changes to the other user in the workspace room
    //   const { roomName, type, drawUpdates } = data;
    //   // socket.to(roomName).emit('whiteboard', { type, drawUpdates });
    //   socket.to(roomName).emit('whiteboard-paths', { currentPaths, isDrawing });
    // });
  
    socket.on('chat-msg', (data) => {
      const { roomName, txt, senderName } = data;
      socket.to(roomName).emit('chat-msg', { txt, senderName });
    });

    // Pointer down event
    socket.on("sketchPointerDown", function ({ roomName, point }) {
      logger.debug(`pointerDown ${JSON.stringify(point)}`)
      if (workspaces[roomName] == null) {
        workspaces[roomName] = {
          drawMode: true,
          isDrawing: false,
          currentPaths: new _immutable.List(),
          canvasColor: "white",
          strokeColor: "red",
          strokeWidth: 4,
          eraserWidth: 20,
        }
      }
      workspaces[roomName].isDrawing = true;
      const { drawMode, strokeColor, canvasColor, strokeWidth, eraserWidth } = workspaces[roomName];
      workspaces[roomName].currentPaths = workspaces[roomName].currentPaths.push(new _immutable.Map({
        drawMode: drawMode,
        strokeColor: drawMode ? strokeColor : canvasColor,
        strokeWidth: drawMode ? strokeWidth : eraserWidth,
        paths: new _immutable.List([point])
      }));

      socketio.to(roomName).emit('whiteboard-paths', { 
        currentPaths: workspaces[roomName].currentPaths,
        isDrawing: workspaces[roomName].isDrawing
      });
    });

    // Pointer move event
    socket.on("sketchPointerMove", function ({ roomName, point }) {
      logger.debug(`pointerMove ${JSON.stringify(point)}`)
      if (workspaces[roomName] == null) {
        workspaces[roomName] = {
          drawMode: true,
          isDrawing: false,
          currentPaths: new _immutable.List(),
          canvasColor: "white",
          strokeColor: "red",
          strokeWidth: 4,
          eraserWidth: 20,
        }
      }
      if (!workspaces[roomName].isDrawing) return;

      workspaces[roomName].currentPaths = workspaces[roomName].currentPaths.updateIn([workspaces[roomName].currentPaths.size - 1], function (pathMap) {
        return pathMap.updateIn(["paths"], function (list) {
          return list.push(point);
        });
      });

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
          currentPaths: new _immutable.List(),
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