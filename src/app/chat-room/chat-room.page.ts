import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { Socket } from 'ng-socket-io';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from '@angular/router';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/Camera/ngx';
import { Base64 } from '@ionic-native/base64/ngx';
import { ActionSheetController } from '@ionic/angular'; // mirar si nececsita import, imagin oque no

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.page.html',
  styleUrls: ['./chat-room.page.scss'],
})
export class ChatRoomPage implements OnInit {

  messages = [];
  images = [];
  nickname = '';
  message = '';
  isImage = false;

  constructor(private navCtrl: NavController, private route: ActivatedRoute,
    private socket: Socket, private toastCtrl: ToastController, private camera: Camera, private base64: Base64,
    public actionSheetController: ActionSheetController) {}

  ngOnInit() {
    this.nickname = this.route.snapshot.paramMap.get('nickname');

    this.getMessages().subscribe(message => {
      this.messages.push(message);
    });

    this.getImages().subscribe(image => {
      this.images.push(image);
    });

    this.getUsers().subscribe(data => {
      const user = data['user'];
      if (data['event'] === 'left') {
        this.showToast('User left: ' + user);
      } else {
        this.showToast('User joined: ' + user);
      }
    });
  }

  sendMessage() {
    this.socket.emit('add-message', { text: this.message });
    this.message = '';
  }

  sendImage(image: any) {
    this.socket.emit('add-image', { text: image });
  }

  getImages() {
    const observable = new Observable(observer => {
      this.socket.on('image', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }

  getMessages() {
    const observable = new Observable(observer => {
      this.socket.on('message', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }

  getUsers() {
    const observable = new Observable(observer => {
      this.socket.on('users-changed', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }

  ionViewWillLeave() {
    this.socket.disconnect();
  }

  async showToast(msg) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000
    });

    toast.present();

  }

  getPicture() {
    const options: CameraOptions = {
      destinationType: this.camera.DestinationType.DATA_URL,
      targetWidth: 1000,
      targetHeight: 1000,
      quality: 100
    };
    this.camera.getPicture( options )
    .then(imageData => {
      const dataI = 'data:image/jpeg;base64,' + imageData;
      this.sendImage(dataI);
    })
    .catch(error => {
      console.error( error );
    });
  }

  getGallery() {
    const options: CameraOptions = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.FILE_URI,
      quality: 100,
      targetWidth: 1000,
      targetHeight: 1000,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true
    };

    this.camera.getPicture( options )
    .then(imageData => {
      const dataI = 'data:image/jpeg;base64,' + imageData;
      this.sendImage(dataI);
    })
    .catch(error => {
      console.error( error );
    });
  }

  getFile() {

  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Enviar un archivo',
      buttons: [{
        text: 'Cámara',
        icon: 'camera',
        handler: () => {
          this.getPicture();
          console.log('Camera clicked');
        }
      }, {
        text: 'Galería',
        icon: 'image',
        handler: () => {
          console.log('Gallery clicked');
        }
      }, {
        text: 'Archivos',
        icon: 'document',
        handler: () => {
          console.log('Play clicked');
        }
      }, {
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }

}
