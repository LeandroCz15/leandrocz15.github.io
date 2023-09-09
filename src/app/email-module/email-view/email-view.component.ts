import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { EmailService } from "../email-services/email.service";
import { Credentials } from "src/app/login-module/credentials";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { KeyValue } from "@angular/common";

@Component({
  selector: "app-email-view",
  templateUrl: "./email-view.component.html",
  styleUrls: ["./email-view.component.css"],
})

export class EmailViewComponent implements OnInit, AfterViewInit {

  @ViewChild('emailViewFilters') emailViewFilters!: ElementRef;
  @ViewChild('emailViewRows') emailViewRows!: ElementRef;

  public programmedEmailList: Array<{
    id: string,
    name: string,
    active: boolean,
    sendHour: number,
    sendMinute: number,
    sendSecond: number,
  }> = [];

  //Amount of filters
  public filtersBox: string[] = ["Letras", "Nombres", "Numeros"];
  //Amount of rows
  public rows: any[] = [{ id: "A", name: "Test", xd: "1" }, { id: "B", name: "Leandro", xd: "2" }];
  //Amount of columns for each row
  public rowValues: string[] = ["A", "B"];

  constructor(private emailService: EmailService, public credentials: Credentials) { 
  }

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
      this.emailViewFilters.nativeElement.scrollLeft = this.emailViewRows.nativeElement.scrollLeft;
    } else {
      this.emailViewRows.nativeElement.scrollLeft = this.emailViewFilters.nativeElement.scrollLeft;
    }
  }

  checkOverflow() {
    if (this.emailViewRows.nativeElement.scrollHeight > this.emailViewRows.nativeElement.clientHeight) {
      this.emailViewFilters.nativeElement.style.maxWidth = `calc(100% - 9px)`;
    } else {
      this.emailViewFilters.nativeElement.style.maxWidth = '100%';
    }
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.filtersBox, event.previousIndex, event.currentIndex);
      if (this.rows.length > 0) {
        let updatedRows = [];
        let properties: string[] = Object.keys(this.rows[0]);
        moveItemInArray(properties, event.previousIndex, event.currentIndex);
        for (let row of this.rows) {
          updatedRows.push(this.reorderObject(row, properties));
        }
        this.rows = updatedRows;
      }
      //moveItemInArray(this.rowValues, event.previousIndex, event.currentIndex);
    }
  }

  reorderObject(obj: any, properties: string[]): void {
    let newObj: any = {};
    for (let property of properties) {
      newObj[property] = obj[property];
    }
    return newObj;
  }

  sortKeys(a: KeyValue<number, string>, b: KeyValue<number, string>): number {
    let filtersBox: string[] = ["Letras", "Nombres", "Numeros"];
    return filtersBox.indexOf(a.key.toString()) > filtersBox.indexOf(b.key.toString()) ? 1 : 0;
  }

}
