import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CazzeonService } from '../cazzeon-service/cazzeon-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginScreenComponent } from './login-screen/login-screen.component';

@NgModule({
  declarations: [
    LoginScreenComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  exports: [
    LoginScreenComponent
  ],
  providers: [
    CazzeonService,
  ]
})
export class LoginModule { }
