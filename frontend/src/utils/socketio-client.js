import socketIOClient from "socket.io-client";
import { getBaseUrl } from './utils';

const backendUrl = getBaseUrl();
let socketIoInstance;

export const getsocketIoInstance = (roomName, componentName) => {
  if (socketIoInstance == null) {
    socketIoInstance = socketIOClient(backendUrl);
    socketIoInstance.emit('join-room', roomName);
    console.log('new socketio instance created', componentName);
  }
  return socketIoInstance;
}