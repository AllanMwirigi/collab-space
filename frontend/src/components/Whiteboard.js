import React,{ useState, useEffect } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import ReactTooltip from 'react-tooltip';

// const styles = {
//   border: "0.0625rem solid #9c9c9c",
//   borderRadius: "0.25rem",
// };

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
  }

  componentDidMount() {

  }

  whiteBoardUpdated = (data) => {
    // console.log(data);
  }
  toggleEraseMode = () => {
    this.canvas.current.eraseMode(!this.state.eraseMode);
    this.setState({ eraseMode: !this.state.eraseMode })
  }

  render() {
    return (
      <div className="whiteboard">
        <h4>Whiteboard</h4>
        <ReactTooltip place="top" type="info" effect="float"/>
        <div className="whiteboard-icons">
          <i className="fas fa-undo" data-tip='Undo' onClick={() => this.canvas.current.undo()}></i> 
          <i className="fas fa-redo" data-tip='Redo' onClick={() => this.canvas.current.redo()}></i>
          <i className="fas fa-eraser" data-tip={this.state.eraseMode ? 'Stop Erase': 'Erase'} onClick={this.toggleEraseMode}></i>
          <i className="fas fa-broom"data-tip='Clear' onClick={() => this.canvas.current.clearCanvas()}></i>
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