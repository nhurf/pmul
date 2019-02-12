import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { Socket } from 'ng-socket-io';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from '@angular/router';
import { Camera, CameraOptions } from '@ionic-native/Camera/ngx';
import { ActionSheetController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { Storage } from '@ionic/storage';

declare var Peer: any;

//  requires a peer of rxjs@* but none is installed. You must install peer dependencies yourself.
//  requires a peer of @ionic-native/core@5.0.0 but none is installed. You must install peer dependencies yourself.
// https://github.com/sivasankars/webrtc-image-snap/blob/master/public/js/main.js

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.page.html',
  styleUrls: ['./chat-room.page.scss'],
})
export class ChatRoomPage implements OnInit {

  peer = new Peer({
    debug: 2,
    key: 'lwjd5qra8257b9', config: {
      'iceServers': [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'turn:numb.viagenie.ca', credential: 'muazkh', username: 'webrtc@live.com' }
      ]
    }
  });

  idFile = 0;
  messages = [];
  files = [];
  mimeType = [];
  nickname = '';
  message = '';
  room = '';
  otherId = '';
  myId;
  conn = null;
  allowUpload = false;
  @ViewChild('content') content;

  constructor(private navCtrl: NavController, private route: ActivatedRoute,
    private socket: Socket, private toastCtrl: ToastController, private camera: Camera,
    public actionSheetController: ActionSheetController, public alertController: AlertController,
    private file: File, private fileOpener: FileOpener, private filePath: FilePath,
    private fileChooser: FileChooser, private clipboard: Clipboard, private storage: Storage) {
    this.storage.get('room').then((val => {
      this.room = val;
    }));
    console.log(this.socket);
  }

  ngOnInit() {
    this.nickname = this.route.snapshot.paramMap.get('nickname');

    this.peer.on('open', (id) => {
      setTimeout(() => {
        this.myId = id;
        console.log('ID is: ' + this.myId);
      }, 1000);
    });

    this.getRTC().subscribe(conn => {
      this.conn = conn;
      console.log(conn);
      this.getData();
    });

    this.getMessages().subscribe(message => {
      this.messages.push(message);
      this.content.scrollToBottom();
    });

    this.getUsers().subscribe(data => {
      const user = data['user'];
      if (data['event'] === 'left') {
        this.showToast(user + ' ha dejado el chat');
      } else {
        this.showToast(user + ' se ha unido al chat');
      }
    });
  }

  sendMessage() {
    this.socket.emit('add-message', { room: this.room, text: this.message, isImage: false, isFile: false, idFile: 'not' });
    this.message = '';
  }

  sendImage(image: any) {
    this.socket.emit('add-message', { room: this.room, text: image, isImage: true, isFile: false, idFile: 'not' });
    this.message = '';
  }

  openFile(id: number) {
    // metodo para abrir el archivo descargado
    alert(this.files[id]);
    alert(this.mimeType[id]);
    this.fileOpener.open(this.files[id], this.mimeType[id])
      .then(() => console.log('File is opened'))
      .catch(e => alert('Error al abrir el archivo' + e));
  }

  getRTC() {
    const observable = new Observable(observer => {
      this.peer.on('connection', (conn) => {
        observer.next(conn);
      });
    });
    return observable;
  }

  getData() {
    this.allowUpload = true;
    alert('Un usuario se ha conectado a ti');
    const observable = new Observable(observer => {
      this.conn.on('data', (data) => {
        observer.next(data);
      });
    }).subscribe(data => {
      const path = this.file.externalDataDirectory;
      alert('Se ha recibido un archivo');
      this.file.writeFile(path, data['nameFile'], data['file']);
      this.files.push(path + data['nameFile']);
      this.mimeType.push(data['mimeType']);
      this.idFile++;
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
      duration: 1500
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
    let mimeType;
    this.fileChooser.open().then(file => {
      this.filePath.resolveNativePath(file).then(resolvedFilePath => {
        const currentPath = resolvedFilePath.substring(0, resolvedFilePath.lastIndexOf('/') + 1);
        const currentName = resolvedFilePath.substring(resolvedFilePath.lastIndexOf('/') + 1);
        this.file.readAsDataURL(currentPath, currentName).then(value => {
          mimeType = value.substring(value.indexOf(':') + 1, value.lastIndexOf(';'));
          this.fileOpener.open(resolvedFilePath, mimeType).then(valuee => {
            this.file.readAsArrayBuffer(currentPath, currentName).then((arrayFile: any) => {
              this.conn.send({ file: arrayFile, nameFile: currentName, mimeType: mimeType });
              this.socket.emit('add-message', {
                room: this.room, text: this.idFile + ' ' + currentName,
                isImage: false, isFile: true, idFile: this.idFile
              });
              this.files.push(resolvedFilePath);
              this.mimeType.push(mimeType);
              this.idFile++;
            }, (err) => {
              alert(err);
            });
          });
        });
      });
    });
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
          if (this.allowUpload) {
            this.getFile();
          } else {
            alert('Debe conectarse con un peer');
          }
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

  async noData() {
    const alert = await this.alertController.create({
      header: 'Faltan datos',
      message: 'Si desea conectarse a un peer debe rellenar el segundo campo',
      buttons: ['OK']
    });

    await alert.present();
  }

  async createPeer() {
    const alert = await this.alertController.create({
      header: 'Crear conexión WEBRTC',
      inputs: [
        {
          id: 'myPeer',
          value: 'Tu peer es ' + this.myId
        },
        {
          id: 'otherId',
          placeholder: 'Peer al que desea conectarse'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            console.log('Cancelar');
          }
        },
        {
          text: 'Compartir peer',
          handler: () => {
            this.socket.emit('add-message', { room: this.room, text: this.myId, isImage: false, isFile: false, idFile: 'not' });
          }
        },
        {
          text: 'Conectarse a un peer',
          handler: (data) => {
            console.log(data[1]);
            if (data[1] === '') {
              this.noData();
            } else {
              this.otherId = data[1];
              this.conn = this.peer.connect(data[1]);
              this.allowUpload = true;
              console.log('Conexión creada');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async pressText(text) {
    this.clipboard.clear();

    const actionSheet = await this.actionSheetController.create({
      header: 'Copiar texto',
      buttons: [{
        text: 'Copiar texto',
        icon: 'text',
        handler: () => {
          this.clipboard.copy(text);
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
