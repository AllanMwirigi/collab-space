import Peer from 'peerjs';

export class PeerConnection {
  createPeerInstance(userId) {
    return new Peer(userId);
  }
  
}