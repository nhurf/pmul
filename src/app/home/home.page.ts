import { Component } from '@angular/core';
import { Socket } from 'ng-socket-io';
import { NavController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  nickname = '';
  room = '';

  constructor(public navCtrl: NavController, private socket: Socket, private toastCtrl: ToastController) { }

  ngOnInit() {
    this.getLog().subscribe(data => {
      if (data === 'full') {
        this.showToast('La sala está llena');
      } 
    });
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
    this.navCtrl.navigateForward('/chat-room/' + this.nickname + this.room);
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
