import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginModule } from './login-module/login.module';
import { BasicViewModule } from './basic-view/basic-view.module';
import { LeftTaskbarModule } from './left-task-bar/left-taskbar.module';
import { TopNavbarModule } from './top-navbar/top-navbar.module';
import { CazzeonService } from './cazzeon-service/cazzeon-service';
import { DatePickerComponent } from './general-components/date-picker/date-picker.component';

@NgModule({
  declarations: [
    AppComponent,
    DatePickerComponent,  
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LoginModule,
    BasicViewModule,
    LeftTaskbarModule,
    TopNavbarModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}
