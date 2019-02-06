import { Component, OnInit } from '@angular/core';
import { Socket } from 'ng-socket-io';
import { NavController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
declare var Peer: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  nickname = '';
  room = '';
  myId;
  peer;

  constructor(public navCtrl: NavController, private socket: Socket, private toastCtrl: ToastController,
    private storage: Storage) { this.createPeer(); }

  ngOnInit() {
    this.getLog().subscribe(data => {
      if (data === 'full') {
        this.showToast('La sala está llena');
      }
    });
  }

  createPeer() {
    this.peer = new Peer({ key: 'lwjd5qra8257b9' });
    setTimeout(() => {
      this.myId = this.peer.id;
      this.storage.set('id', this.peer.id);
      console.log('My peer ID is: ' + this.myId);
    }, 3000);
  }

  async showToast(msg) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000
    });

    toast.present();

  }

  joinChat() {
    this.socket.connect();
    this.socket.emit('create', this.room);
    this.socket.emit('set-nickname', this.nickname);
    this.socket.emit('myId', this.myId);
    this.navCtrl.navigateForward('/chat-room/' + this.nickname);
  }

  getLog() {
    const observable = new Observable(observer => {
      this.socket.on('full', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }

}
