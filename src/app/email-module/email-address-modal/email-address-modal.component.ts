import { Component, OnInit } from '@angular/core';
import { EmailService } from '../email-services/email.service';
import { FormsModule } from '@angular/forms';
import { AddressService } from '../email-services/address.service';

@Component({
  selector: 'app-email-address-modal',
  templateUrl: './email-address-modal.component.html',
  styleUrls: ['./email-address-modal.component.css']
})

export class EmailAddressModalComponent implements OnInit {

  public addresses: Array<string> = [];

  public originalAddresses: Array<string> = [];

  public newAddress: string = "";

  public newAddressError: boolean = false;

  constructor(private emailService: EmailService, private addressService: AddressService) { }

  ngOnInit() {
    this.addFocusEventOnInit();
    let selectedEmailObservable = this.emailService.getSelectedEmailObservable();
    selectedEmailObservable.subscribe(
      info => {
        if (info && info.addresses) {
          this.originalAddresses = info.addresses.slice();
          this.addresses = this.originalAddresses.slice();
        }
      }
    );
  }

  trackByFn(index: number, item: any): number {
    // Function needed for *ngFor loop
    return index;
  }

  addAddress() {
    // Add a address after validate it, then clean the input
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (emailRegex.test(this.newAddress)) {
      this.addresses.push(this.newAddress);
      this.newAddress = "";
      this.newAddressError = false;
    } else {
      this.newAddressError = true;
    }
  }

  removeAddress(index: number) {
    // Remove an address when clicking in the left-button
    this.addresses.splice(index, 1);
  }

  close() {
    // When closing, discard changes
    this.newAddress = "";
    this.addresses.splice(0);
    this.addresses = this.originalAddresses.slice();
  }

  save() {
    // Save the addresses to update the current programmed email
    this.addressService.setAddressList(this.addresses);
  }

  addFocusEventOnInit() {
    // Focus email input when showing address modal
    $('#addAddresses').on('shown.bs.modal', function () {
      $('#emailInput').focus();
    })
  }

}