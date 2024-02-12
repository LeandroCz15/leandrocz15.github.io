import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeftTaskbarComponent } from './left-taskbar/left-taskbar.component';
import { NavbarElementComponent } from './navbarelement/navbarelement.component';
import { BasicViewModule } from '../basic-view/basic-view.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  declarations: [
    LeftTaskbarComponent,
    NavbarElementComponent,
  ],
  imports: [
    CommonModule,
    BasicViewModule,
    NgbModule
  ],
  exports: [
    LeftTaskbarComponent,
    NavbarElementComponent
  ]
})
export class LeftTaskbarModule { }
