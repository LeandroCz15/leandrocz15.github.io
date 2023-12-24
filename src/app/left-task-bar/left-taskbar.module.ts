import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeftTaskbarComponent } from './left-taskbar/left-taskbar.component';
import { NavbarElementComponent } from './navbarelement/navbarelement.component';



@NgModule({
  declarations: [
    LeftTaskbarComponent,
    NavbarElementComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    LeftTaskbarComponent,
    NavbarElementComponent
  ]
})
export class LeftTaskbarModule { }
