import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailViewComponent } from './email-view/email-view.component';
import { EmailModalComponent } from './email-modal/email-modal.component';
import { EmailService } from './email-services/email.service';
import { FormsModule } from '@angular/forms';
import { TwoDigitPipe } from './two-digit.pipe';
import { EmailAddressModalComponent } from './email-address-modal/email-address-modal.component';
import { AddressService } from './email-services/address.service';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    EmailViewComponent,
    EmailModalComponent,
    TwoDigitPipe,
    EmailAddressModalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
  ],
  exports: [
    EmailViewComponent,
    EmailModalComponent,
    EmailAddressModalComponent,
  ],
  providers: [
    EmailService,
    AddressService,
  ],
})
export class EmailModule { }
