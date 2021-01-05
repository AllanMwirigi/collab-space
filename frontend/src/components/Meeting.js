import React from 'react';
import ReactDOM from 'react-dom';
import BounceLoader from 'react-spinners/BounceLoader';
import { css } from "@emotion/core";
import Peer from 'peerjs';
import { toast } from 'react-toastify';
import { getsocketIoInstance } from '../utils//socketio-client';
import { getPeerConfig } from '../utils/utils';

export default class Meeting extends React.Component {
  constructor() {
    super();
    this.spinnerStyles = css`
      display: block;
      align-self: center;
      position: absolute;
      top: 40%;
      z-index: 1000;
    `;
    this.state = {
      loading: false, joined: false
    }
    this.peerId = null; this.localPeer = null; this.remotePeers = []; this.videoData = {}; this.quality = 12;
    this.videoElemRefs = {};
    this.videoContainerRef = React.createRef();
    this.roomName = sessionStorage.getItem('roomName');
    this.displayName = sessionStorage.getItem('displayName'); // the name of this user
    this.socketIo = getsocketIoInstance(this.roomName, this.displayName, 'Meeting');
  }

  componentDidMount() {
    this.socketIo.on('peer-join', (userId) => {
      // another user/peer has joined the call
    });
  }

  initConnection = async () => {
    this.setState({ loading: true });
    const peerConfig = getPeerConfig();
    this.localPeer = new Peer('', { host: peerConfig.host, port: peerConfig.port, path: '/peertc' });
    this.localPeer.on('open', (id) => {
      console.log('local peer connected', id);
      this.localPeerId = id;
      this.initLocalStream(id);
      this.socketIo.emit('peer-join', { roomName: this.roomName, peerId: id });
    });
    this.localPeer.on('error', (err) => {
      console.log('local peer connection error', err.message);
      this.localPeer.reconnect();
      toast.error('Error initiating meeting', { autoClose: 10000 });
    })
  }

  initLocalStream = (localId, enableVideo = true, enableAudio = true) => {
    const myNavigator = navigator.mediaDevices.getUserMedia || 
    navigator.mediaDevices.webkitGetUserMedia || 
    navigator.mediaDevices.mozGetUserMedia || 
    navigator.mediaDevices.msGetUserMedia;
    myNavigator({
      video: enableVideo ? {
        frameRate: this.quality,
        noiseSuppression: true,
        width: {min: 640, ideal: 1280, max: 1920},
        height: {min: 480, ideal: 720, max: 1080}
      } : false,
      audio: enableAudio,
    })
    .then((stream) => {
      if (stream) {
        this.createVideo({ id: localId, stream });
        this.listenForPeers(stream);
        this.socketIo.on('peer-join', (otherPeerId) => {
          console.log('New User Connected', otherPeerId);
          this.connectToNewUser(otherPeerId, stream);
        });
      }
    });
  }

  createVideo = (data) => {
    if (this.videoData[data.id] == null) {
      this.videoData[data.id] = { ...data,  };
      const videoElem = React.createElement('video', { 
        ref: ref => this.videoElemRefs[data.id] = ref, // ref: this.videoElemRefs[data.id], 
        className: 'video-elem', id: data.id, autoPlay: true,
        // srcObject: this.videoData[data.id].stream, // not allowed by React, so used the ref instead
      });
      const videoWrapper = React.createElement('div', { className: 'video-wrapper' }, videoElem);
      ReactDOM.render(videoWrapper, document.getElementById('video-container'));
      this.videoElemRefs[data.id].srcObject = this.videoData[data.id].stream;
      if (this.localPeerId === data.id) {
        this.setState({ loading: false, joined: true }); // hide loader, show end call btn
        // videoElem.muted = true; // TODO: should be muted by default
      }
    } else {
      const elemRef = this.videoElemRefs[data.id];
      if (elemRef != null) {
        elemRef.srcObject = data.stream
      }
    }
  }

  listenForPeers = (localStream) => {
    // listening for any incoming video stream from another user and will stream our data in peer.answer(ourStream).
    this.localPeer.on('call', (call) => {
      call.answer(localStream);
      call.on('stream', (userVideoStream) => {
        console.log('user stream data', userVideoStream)
        this.createVideo({ id: call.metadata.id, stream: userVideoStream });
      });
      call.on('close', () => {
        console.log('closing peers listeners', call.metadata.id);
        this.removeVideo(call.metadata.id);
      });
      call.on('error', () => {
        console.log('peer error ------');
        this.removeVideo(call.metadata.id);
      });
      this.remotePeers[call.metadata.id] = call;
    });
  }

  connectToNewUser(otherPeerId, stream) {
    const call = this.localPeer.call(otherPeerId, stream, { metadata: { id: this.localPeerId }});
    call.on('stream', (userVideoStream) => {
      this.createVideo({ id: otherPeerId, stream: userVideoStream });
    });
    call.on('close', () => {
      console.log('other peer closed', otherPeerId);
      this.removeVideo(otherPeerId);
    });
    call.on('error', () => {
      console.log('peer error ------')
      this.removeVideo(otherPeerId);
    })
    this.remotePeers[otherPeerId] = call;
  }
  removeVideo = (id) => {
    delete this.videoData[id];
    const elemRef = this.videoElemRefs[id];
    if (elemRef != null) {
      elemRef.remove();
      delete this.videoElemRefs[id];
    }
  }
  destoryConnection = () => {
    const data = this.videoData[this.localPeerId];
    if (data != null && data.stream.getTracks() != null) {
      data.stream.getTracks().forEach((track) => {
        track.stop();
      })
    }
    
    this.socketIo.emit('peer-leave', { roomName: this.roomName, peerId: this.localPeerId });
    this.localPeer.destroy();
    this.removeVideo(this.localPeerId);
  }

  leaveCall = () => {
    this.destoryConnection();
    this.setState({ joined: false });
  }

  render() {
    const { loading, joined } = this.state;
    return(
      <div className="meeting-component">
        <h4>Meeting</h4>
        <div className="meeting-container">
        {/* <div id="video-container" ref={this.videoContainerRef}> */}
          { !loading && !joined && <button className="call-btn" onClick={this.initConnection}>Start Call</button> }
          { loading && !joined && <BounceLoader loading={loading} color="#36d7b7" css={this.spinnerStyles} size={100} /> }
          {/* { joined &&  <div id="video-container" ref={this.videoContainerRef}></div> } */}
          <div id="video-container" ref={this.videoContainerRef}></div>
          { joined && <button className="end-call-btn" onClick={this.leaveCall}>End Call</button> }
        </div>
      </div>
    );
  }
}