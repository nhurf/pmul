import { Component } from '@angular/core';
import { Socket } from 'ng-socket-io';
import { NavController} from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  nickname = '';

  constructor(public navCtrl: NavController, private socket: Socket) { }
 
  joinChat() {
    this.socket.connect();
    this.socket.emit('set-nickname', this.nickname);
    this.navCtrl.navigateForward('/chat-room/' + this.nickname);
  }

}
