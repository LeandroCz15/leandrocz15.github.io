import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth-service';
import { ApplicationLoginModalComponent } from './application-login-modal/application-login-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ApplicationLoginModalComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  exports: [
    ApplicationLoginModalComponent
  ],
  providers: [
    AuthService,
  ]
})
export class LoginModule { }
