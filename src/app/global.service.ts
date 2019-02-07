import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

declare var Peer: any;

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  peer;

  constructor(private storage: Storage) { }

  createPeer() {
    this.peer = new Peer({ debug: 2,
      key: 'lwjd5qra8257b9', config: {
        'iceServers': [
          { url: 'stun:stun.l.google.com:19302' },
          { url: 'turn:numb.viagenie.ca', credential: 'muazkh', username: 'webrtc@live.com' }
        ]
      }
    });
    this.peer.on('open', function (id) {
      console.log('My peer ID is: ' + id);
    });
    setTimeout(() => {
      this.storage.set('id', this.peer.id);
    }, 3000);
  }
}
