import React,{ useState, useEffect } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import ReactTooltip from 'react-tooltip';
import { getsocketIoInstance } from '../utils/socketio-client';

export default class Whiteboard extends React.Component {
  constructor(props) {
    super(props);
    this.styles = {
      border: "0.0625rem solid #9c9c9c",
      borderRadius: "0.25rem",
    };
    this.canvas = React.createRef();
    this.state = {
      eraseMode: false
    }
    this.WhiteBoardMsgType = {
      canvas_draw: 1,
      canvas_undo: 2,
      canvas_redo: 3,
      canvas_clear: 4,
    }
    this.roomName = sessionStorage.getItem('roomName');
    this.socketIo = getsocketIoInstance(roomName, 'Whiteboard');
  }

  componentDidMount() {
    this.socketIo.on('whiteboard', (changes) => {
      console.log('whiteboard updated', changes);
    });
  }

  whiteBoardUpdated = (drawUpdates) => {
    // console.log(data);
    const changes = { roomName: this.roomName, type: this.WhiteBoardMsgType.canvas_draw, drawUpdates }
    this.socketIo.emit('whiteboard', changes);
  }
  toggleEraseMode = () => {
    this.canvas.current.eraseMode(!this.state.eraseMode);
    this.setState({ eraseMode: !this.state.eraseMode })
  }
  undoCanvas = () => {
    this.canvas.current.undo();
    const changes = { roomName: this.roomName, type: this.WhiteBoardMsgType.canvas_undo }
    this.socketIo.emit('whiteboard', changes);
  }
  redoCanvas = () => {
    this.canvas.current.redo();
    const changes = { roomName: this.roomName, type: this.WhiteBoardMsgType.canvas_redo }
    this.socketIo.emit('whiteboard', changes);
  }
  clearCanvas = () => {
    this.canvas.current.clearCanvas();
    const changes = { roomName: this.roomName, type: this.WhiteBoardMsgType.canvas_clear }
    this.socketIo.emit('whiteboard', changes);
  }

  render() {
    return (
      <div className="whiteboard">
        <h4>Whiteboard</h4>
        <ReactTooltip place="top" type="info" effect="float"/>
        <div className="whiteboard-icons">
          <i className="fas fa-undo" data-tip='Undo' onClick={this.undoCanvas}></i> 
          <i className="fas fa-redo" data-tip='Redo' onClick={this.redoCanvas}></i>
          <i className="fas fa-eraser" data-tip={this.state.eraseMode ? 'Stop Erase': 'Erase'} 
            onClick={this.toggleEraseMode}></i>
          <i className="fas fa-broom"data-tip='Clear' onClick={this.clearCanvas}></i>
        </div>
        <ReactSketchCanvas
          ref={this.canvas}
          style={this.styles}
          // width="600"
          // height="400"
          strokeWidth={4}
          strokeColor="red"
          eraserWidth={20}
          onUpdate={this.whiteBoardUpdated}
        />
      </div>
      
    );
  }
}