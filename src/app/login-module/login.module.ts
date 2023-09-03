import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Credentials } from './credentials';
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
    Credentials,
  ]
})
export class LoginModule { }
