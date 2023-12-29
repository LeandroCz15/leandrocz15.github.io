import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ComponentsModule } from './components/components.module';
import { MageComponent } from './components/mage/mage.component';
import { EmailModule } from './email-module/email.module';
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
    ComponentsModule,
    EmailModule,
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
