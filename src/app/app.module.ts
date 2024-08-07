import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginModule } from './login-module/login.module';
import { BasicViewModule } from './basic-view/basic-view.module';
import { LeftTaskbarModule } from './left-task-bar/left-taskbar.module';
import { TopNavbarModule } from './top-navbar/top-navbar.module';
import { ViewFinderComponent } from './standalone/view-finder/view-finder.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LoginModule,
    BasicViewModule,
    LeftTaskbarModule,
    TopNavbarModule,
    ViewFinderComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}
