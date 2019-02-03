import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'chat-room', loadChildren: './chat-room/chat-room.module#ChatRoomPageModule' },
  { path: 'chat-room/:nickname', loadChildren: './chat-room/chat-room.module#ChatRoomPageModule' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
