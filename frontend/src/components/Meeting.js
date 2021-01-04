import React from 'react';
import { getsocketIoInstance } from '../utils/socketio-client';
import { createPeerConnInstance } from '../utils/peer-conn';
import BounceLoader from 'react-spinners/BounceLoader';
import { css } from "@emotion/core";
import { toast } from 'react-toastify';

export default class Meeting extends React.Component {
  constructor() {
    super();
    this.spinnerStyles = css`
      display: block;
      align-self: center;
      margin-top: auto;
      margin-bottom: auto;
    `;
    this.state = {
      loading: false, joined: false
    }
    // this.peerId = null; this.localPeer = null; this.remotePeers = []; this.videoData = {};
    this.videoContainerRef = React.createRef();
    this.roomName = sessionStorage.getItem('roomName');
    this.displayName = sessionStorage.getItem('displayName'); // the name of this user
    this.socketIo = getsocketIoInstance(this.roomName, this.displayName, 'Meeting');
    this.peerConnInstance = React.createRef();
  }

  componentDidMount() {
    this.socketIo.on('peer-join', (userId) => {
      // another user/peer has joined the call
    });
  }

  initConnection = async () => {
    this.setState({ loading: true });
    try {
      // const response = await axios.get(`${getBaseUrl()}/api/v1/peer-join`);
      // this.peerId = response.data.peerId;
      // console.log('peer-req', this.peerId);
      this.peerConnInstance.current = createPeerConnInstance(this.roomName, this.displayName);
      this.setState({ loading: false, joined: true }); // TODO: try do this in the above
    } catch (error) { 
      toast.error('Error initializing video call');
      this.setState({ loading: false });
    }
  }

  showVideo = () => {
    this.setState({ loading: false, joined: true });
  }
  leaveCall = () => {
    this.peerConnInstance.current.destroyConnection();
    this.setState({ joined: false })
  }

  render() {
    const { loading, joined } = this.state;
    return(
      <div className="meeting-component">
        <h4>Meeting</h4>
        {/* <div className="meeting-container"> */}
        <div id="video-container">
          { !loading && !joined && <button className="call-btn" onClick={this.initConnection}>Start Call</button> }
          { loading && <BounceLoader loading={this.state.loading} color="#36d7b7" css={this.spinnerStyles} size={100} /> }
          {/* { joined &&  <div id="video-container" ref={this.videoContainerRef}></div> } */}
          {/* <div id="video-container" ref={this.videoContainerRef}></div> */}
          { joined && <button className="end-call-btn" onClick={this.leaveCall}>End Call</button> }
        </div>
      </div>
    );
  }
}