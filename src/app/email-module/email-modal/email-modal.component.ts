import { Component, OnInit } from "@angular/core";
import { EmailService } from "../email-services/email.service";
import { AuthService } from "src/app/login-module/auth-service";
import { AddressService } from "../email-services/address.service";

@Component({
  selector: "app-email-modal",
  templateUrl: "./email-modal.component.html",
  styleUrls: ["./email-modal.component.css"]
})
export class EmailModalComponent implements OnInit {

  public programmedEmail: {
    id: string,
    name: string,
    body: string,
    active: boolean,
    sendHour: number,
    sendMinute: number,
    sendSecond: number,
    sendMonday: boolean,
    sendTuesday: boolean,
    sendWednesday: boolean,
    sendThursday: boolean,
    sendFriday: boolean,
    sendSaturday: boolean,
    sendSunday: boolean,
    appUser: string,
    addresses: Array<string>,
  } | null = {
      id: "",
      name: "",
      body: "",
      active: false,
      sendHour: 0,
      sendMinute: 0,
      sendSecond: 0,
      sendMonday: false,
      sendTuesday: false,
      sendWednesday: false,
      sendThursday: false,
      sendFriday: false,
      sendSaturday: false,
      sendSunday: false,
      appUser: "",
      addresses: [],
    };

  constructor(private emailService: EmailService, private authService: AuthService, private addressService: AddressService) { }

  ngOnInit() {
    this.emailService.getSelectedEmailObservable().subscribe(
      info => {
        if (info) {
          this.programmedEmail = Object.assign({}, info);
        }
      }
    );
    this.addressService.getAddressListObservable().subscribe(
      info => {
        if(info){
          this.programmedEmail!.addresses = info;
        }
      }
    )
  }

  dismiss() {
    this.programmedEmail = null;
  }

  async saveProgrammedEmail() {
    // Send current programmed email to server
    let postProgrammedEmail = await fetch("http://localhost:8080/api/programmedemail", {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa(this.authService.getUser().email + ":" + this.authService.getUser().password),
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": this.authService.getToken()!
      },
      body: JSON.stringify(this.programmedEmail)
    });
    if (postProgrammedEmail.ok) {
      // If response is ok, update the email of the view
      this.emailService.setUpdateProgrammedEmail(await postProgrammedEmail.json());
    }
  }

}