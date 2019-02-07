import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { Socket } from 'ng-socket-io';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from '@angular/router';
import { Camera, CameraOptions } from '@ionic-native/Camera/ngx';
import { Base64 } from '@ionic-native/base64/ngx';
import { ActionSheetController } from '@ionic/angular';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { GlobalService } from './../global.service';
import { Storage } from '@ionic/storage';

//  requires a peer of rxjs@* but none is installed. You must install peer dependencies yourself.
//  requires a peer of @ionic-native/core@5.0.0 but none is installed. You must install peer dependencies yourself.
// https://github.com/sivasankars/webrtc-image-snap/blob/master/public/js/main.js

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.page.html',
  styleUrls: ['./chat-room.page.scss'],
})
export class ChatRoomPage implements OnInit {

  messages = [];
  nickname = '';
  message = '';
  room = '';
  myId = this.global.peer.id;
  otherId = null;
  hasOtherId = false;
  conn = null;

  constructor(private navCtrl: NavController, private route: ActivatedRoute,
    private socket: Socket, private toastCtrl: ToastController, private camera: Camera, private base64: Base64,
    public actionSheetController: ActionSheetController, private imagePicker: ImagePicker, private global: GlobalService,
    private storage: Storage) {
    while (!this.hasOtherId) {
      if (this.otherId === null) {
        this.hasOtherId = true;
        this.socket.emit('needId');
      }
    }
  }

  ngOnInit() {
    this.nickname = this.route.snapshot.paramMap.get('nickname');

    this.getMessages().subscribe(message => {
      this.messages.push(message);
    });

    this.getDataRTC().subscribe(data => {
      console.log(data);
    });

    this.getrequestId().subscribe(data => {
      this.socket.emit('myId', this.myId);
    });

    this.getId().subscribe(data => {
      const d = data['id'];
      if (d !== this.myId) {
        this.otherId = d;
        console.log('ID del otro ' + this.otherId);
        if (this.conn === null) {
          this.conn = this.global.peer.connect(this.otherId);
          console.log(this.conn);
        }
      }
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

  createVideo() {
  }

  createCall() {

  }

  getUserVideo() {

  }

  sendMp2p() {
  }

  sendMessage() {
    this.socket.emit('add-message', { text: this.message, isImage: false });
    this.message = '';
  }

  sendImage(image: any) {
    this.socket.emit('add-message', { text: image, isImage: true });
    this.message = '';
  }

  getDataRTC() {
    const observable = new Observable(observer => {
      this.global.peer.on('connection', function(data) {
        observer.next(data);
      });
    });
    return observable;
  }

  getData() {

  }

  getId() {
    const observable = new Observable(observer => {
      this.socket.on('id', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }

  getrequestId() {
    const observable = new Observable(observer => {
      this.socket.on('requestId', (data) => {
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
    this.camera.getPicture(options)
      .then(imageData => {
        const dataI = 'data:image/jpeg;base64,' + imageData;
        this.sendImage(dataI);
      })
      .catch(error => {
        console.error(error);
      });
  }

  getGallery() {
    const options: CameraOptions = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };
    this.camera.getPicture(options).then((imageData) => {
      const dataI = 'data:image/jpeg;base64,' + imageData;
      this.sendImage(dataI);
    }, (err) => {
      // Handle error
      console.log(err);
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
          this.getGallery();
          console.log('Gallery clicked');
        }
      }, {
        text: 'Archivos',
        icon: 'document',
        handler: () => {
          this.getFile();
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
