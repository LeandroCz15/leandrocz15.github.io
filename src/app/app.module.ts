import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginModule } from './login-module/login.module';
import { ProductModule } from './product-module/product-module.module';
import { BasicViewModule } from './basic-view/basic-view.module';
import { LeftTaskbarModule } from './left-task-bar/left-taskbar.module';

@NgModule({
  declarations: [
    AppComponent,  
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LoginModule,
    ProductModule,
    BasicViewModule,
    LeftTaskbarModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {

}
