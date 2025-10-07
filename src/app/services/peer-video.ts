// src/app/services/peer-video.service.ts
import { Injectable } from '@angular/core';
import Peer, { MediaConnection } from 'peerjs';
import { detectBackend } from '../env';

@Injectable({ providedIn: 'root' })
export class PeerVideoService {
  private peer!: Peer;
  private localStream!: MediaStream;

  /**
   * Initialize PeerJS against the ExpressPeerServer mounted at /peerjs
   * Auto-detects HTTPS/host inside ELF.
   * Optionally pass a fixed ID (e.g., currentUser._id) to reuse the same peer id.
   */
  initPeer(fixedId?: string): Promise<string> {
    const { host, port, secure, peerPath } = detectBackend();
    const opts = {
      host,
      port,
      path: peerPath,
      secure,
      // config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
    } as const;
  
    return new Promise((resolve, reject) => {
      // ✅ use the correct constructor overload
      this.peer = fixedId ? new Peer(fixedId, opts) : new Peer(opts);
  
      this.peer.on('open', (id) => resolve(id));
      this.peer.on('error', (err) => reject(err));
    });
  }

  /** Grab local camera/mic; for 2-tab tests you can pass { video:false, audio:false } on one tab */
  async getLocalStream(constraints: MediaStreamConstraints = { video: true, audio: true }): Promise<MediaStream> {
    this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
    return this.localStream;
  }

  /** Place an outbound call to remotePeerId */
  call(remotePeerId: string, onRemoteStream: (s: MediaStream) => void): MediaConnection {
    const call = this.peer.call(remotePeerId, this.localStream);
    call.on('stream', onRemoteStream);
    return call;
  }

  /** Listen for incoming calls */
  onIncomingCall(handler: (call: MediaConnection) => void): void {
    this.peer.on('call', handler);
  }

  /** Answer an incoming call */
  answer(call: MediaConnection, onRemoteStream: (s: MediaStream) => void): void {
    call.answer(this.localStream);
    call.on('stream', onRemoteStream);
  }

  /** Current peer id */
  get id(): string { return this.peer?.id; }

  /** Cleanup */
  destroy(): void {
    try { this.peer?.destroy(); } catch {}
  }
}
