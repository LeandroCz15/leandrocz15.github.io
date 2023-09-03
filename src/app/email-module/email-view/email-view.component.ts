import { Component, OnInit } from "@angular/core";
import { EmailService } from "../email-services/email.service";
import { Credentials } from "src/app/login-module/credentials";

@Component({
  selector: "app-email-view",
  templateUrl: "./email-view.component.html",
  styleUrls: ["./email-view.component.css"]
})
export class EmailViewComponent implements OnInit {

  public programmedEmailList: Array<{
    id: string,
    name: string,
    active: boolean,
    sendHour: number,
    sendMinute: number,
    sendSecond: number,
  }> = [];

  constructor(private emailService: EmailService, public credentials: Credentials) { }

  ngOnInit() {
    this.fetchProgrammedEmailList();
    this.emailService.getUpdateProgrammedEmailObservable().subscribe(
      info => {
        if (info) {
          let index: number = this.programmedEmailList.findIndex(object => object.id == info.id);
          if (index != -1) {
            this.programmedEmailList[index] = info;
          } else {
            this.programmedEmailList.push(info);
          }
        }
      }
    );
    this.credentials.getCredentialsObservable().subscribe(
      info => {
        if (info && info.getUsserId() != "") {
          this.fetchProgrammedEmailList();
        }
      }
    );
  }

  openProgrammedEmail(programmedEmail: any) {
    // Open a programmed email modal after clicking it
    programmedEmail.appUsser = this.credentials.getUsserId()!;
    this.emailService.setSelectedEmail(programmedEmail);
  }

  async fetchProgrammedEmailList() {
    // Fetch programmed emails if credentials are present
    let usserId = this.credentials.getUsserId();
    if (usserId == "") {
      return;
    }
    let fetchProgrammedEmails = await fetch("http://localhost:8080/api/programmedemail/" + this.credentials.getUsserId(), {
      method: "GET",
      headers: {
        "Authorization": "Basic " + btoa(this.credentials.getEmail() + ":" + this.credentials.getPassword()),
        "Accept": "application/json",
        "Origin": "https://leandrocz15.github.io/",
      }
    });
    this.programmedEmailList = await fetchProgrammedEmails.json();
  }

  trackByFn(index: number, item: any): number {
    // Function needed for *ngFor loop
    return index;
  }

}
