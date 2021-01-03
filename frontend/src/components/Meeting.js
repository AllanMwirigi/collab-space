import React from 'react';
import axios from 'axios';
import { getBaseUrl } from '../utils/utils';
import { getsocketIoInstance } from '../utils/socketio-client';
import BounceLoader from 'react-spinners/BounceLoader';
import { css } from "@emotion/core";
import { toast } from 'react-toastify';
import Peer from 'peerjs';


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
    this.userId = null; this.localPeer = null; this.remotePeers = [];
    this.roomName = sessionStorage.getItem('roomName');
    this.displayName = sessionStorage.getItem('displayName'); // the name of this user
    this.socketIo = getsocketIoInstance(this.roomName, this.displayName, 'Meeting');
  }

  componentDidMount() {
    this.socketIo.on('peer-join', (userId) => {
      // another user/peer has joined the call
    });
  }

  initCall = async () => {
    this.setState({ loading: true });
    try {
      const response = await axios.get(`${getBaseUrl()}/api/v1/peer-join`);
      this.userId = response.data.userId;
      this.socketIo.emit('peer-join', { roomName: this.roomName, userId: this.userId });
      console.log('peer-join', this.userId);
      this.initLocalPeer();
    } catch (error) { 
      toast.error('Error initializing video call');
      this.setState({ loading: false });
    }
  }

  initLocalPeer = async () => {
    this.localPeer = new Peer(userId, { host: `${getBaseUrl()}` });
    this.localPeer.on('open', (id) => {
      console.log('local peer connected', id);
      this.initLocalStream();
    });
    this.localPeer.on('error', (err) => {
      console.log('local peer connection error', err.message);
      this.localPeer.reconnect();
    })
  }

  initLocalStream = () => {

  }

  render() {
    const { loading, joined } = this.state;
    return(
      <div className="meeting-component">
        <h4>Meeting</h4>
        <div className="remote-video">
          { !loading && !joined && <button className="call-btn" onClick={this.initCall}>Start Call</button> }
          { loading && <BounceLoader loading={this.state.loading} color="#36d7b7" css={this.spinnerStyles} size={100} /> }
        </div>
      </div>
    );
  }
}