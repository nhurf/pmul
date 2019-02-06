import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';
import { Camera } from '@ionic-native/Camera/ngx';
import { Base64 } from '@ionic-native/base64/ngx';
import { ImagePicker } from '@ionic-native/image-picker/ngx';

const config: SocketIoConfig = { url: 'http://95.179.148.127:3001', options: {} };
declare var Peer: any;

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, SocketIoModule.forRoot(config)],
  providers: [
    StatusBar,
    SplashScreen,
    Camera,
    Base64,
    ImagePicker,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
