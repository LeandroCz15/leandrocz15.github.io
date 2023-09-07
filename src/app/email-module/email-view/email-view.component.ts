import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { EmailService } from "../email-services/email.service";
import { Credentials } from "src/app/login-module/credentials";

@Component({
  selector: "app-email-view",
  templateUrl: "./email-view.component.html",
  styleUrls: ["./email-view.component.css"]
})
export class EmailViewComponent implements OnInit, AfterViewInit {

  @ViewChild('scrollable1') scrollable1!: ElementRef;
  @ViewChild('scrollable2') scrollable2!: ElementRef;

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

  ngAfterViewInit() {
    this.checkOverflow();
  }

  checkOverflow() {
    if (this.scrollable2.nativeElement.scrollHeight > this.scrollable2.nativeElement.clientHeight) {
      this.scrollable1.nativeElement.style.maxWidth = `calc(100% - 9px)`;
    } else {
      this.scrollable1.nativeElement.style.maxWidth = '100%';
    }
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

  syncScroll(isListScroll: number) {
    if (isListScroll) {
      this.scrollable1.nativeElement.scrollLeft = this.scrollable2.nativeElement.scrollLeft;
    } else {
      this.scrollable2.nativeElement.scrollLeft = this.scrollable1.nativeElement.scrollLeft
    }
  }

}
