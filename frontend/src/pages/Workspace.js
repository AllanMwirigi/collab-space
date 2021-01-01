import React from "react";
import { toast } from 'react-toastify';
import { Whiteboard } from '../components/Whiteboard';
import Chat from '../components/Chat';
import { getsocketIoInstance } from '../utils/socketio-client';
// import '../App.css';

// https://www.npmjs.com/package/react-canvas-draw - alternative whiteboard option
// https://www.npmjs.com/package/react-chat-elements
// https://www.cometchat.com/tutorials/cometchat-react-chat-elements

export default class Workspace extends React.Component {
  constructor() {
    super();
    this.roomName = sessionStorage.getItem('roomName');
    this.displayName = sessionStorage.getItem('displayName'); // the name of this user
    this.socketIo = getsocketIoInstance(this.roomName, this.displayName, 'Workspace');
  }

  componentDidMount() {
    this.socketIo.on('join-room', (otherUserName) => {
      toast.info(`${otherUserName} has joined this workspace`);
    });
    // TODO: notify of workspace leave
  }

  render() {
    return(
      <div className="workspace">
        <Whiteboard/>
        <Chat/>
      </div>
    );
  }
}