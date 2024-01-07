import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeftTaskbarComponent } from './left-taskbar/left-taskbar.component';
import { NavbarElementComponent } from './navbarelement/navbarelement.component';
import { IconSrcResolverPipe } from './pipes/icon-src-resolver.pipe';



@NgModule({
  declarations: [
    LeftTaskbarComponent,
    NavbarElementComponent,
    IconSrcResolverPipe
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
