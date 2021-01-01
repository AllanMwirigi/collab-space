import React from "react";
import Whiteboard from '../components/Whiteboard';
import Chat from '../components/Chat';
import '../App.css';

// https://www.npmjs.com/package/react-canvas-draw - alternative whiteboard option
// https://www.npmjs.com/package/react-chat-elements
// https://www.cometchat.com/tutorials/cometchat-react-chat-elements

export default function Workspace() {
  return(
    <div className="workspace">
      <Whiteboard/>
      <Chat/>
    </div>
  );
}