import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { EmailService } from "../email-services/email.service";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { KeyValue } from "@angular/common";
import { AuthService } from "src/app/login-module/auth-service";

@Component({
  selector: "app-email-view",
  templateUrl: "./email-view.component.html",
  styleUrls: ["./email-view.component.css"],
})

export class EmailViewComponent implements OnInit, AfterViewInit {

  @ViewChild('emailViewFilters') emailViewFilters!: ElementRef;
  @ViewChild('belowFilters') belowFilters!: ElementRef;
  @ViewChild('belowRows') belowRows!: ElementRef;
  @ViewChild('emailViewRows') emailViewRows!: ElementRef;
  @ViewChild('footer') footer!: ElementRef;

  private isDragging: boolean = false;
  private starterPosition: number = 0;
  private starterHeight: number = 0;
  /*
    Offset in scroll to prevent the cursor moving out of the footer div while is being resized.
    With this value the div will be always be faster in expansion than the cursor
  */
  private scrollOffset = 7;
  // Boolean to re-render view
  public reload: boolean = true;
  // Amount of column filters
  public filters: any[] = [{ name: "id", value: '' }, { name: "name", value: '' }, { name: "number", value: '' }];
  // This array will contain the data of the current rows, but it can be modified
  public renderedRows: any[] = [];
  // This array will contain the data of the current rows
  public originalRowData: any[] = [];

  public operatorMap: { [key: string]: (a: number, b: number) => boolean } = {
    '<=': (a, b) => a <= b,
    '>=': (a, b) => a >= b,
    '<': (a, b) => a < b,
    '>': (a, b) => a > b,
  };

  public programmedEmailList: Array<{
    id: string,
    name: string,
    active: boolean,
    sendHour: number,
    sendMinute: number,
    sendSecond: number,
  }> = [];

  constructor(private emailService: EmailService, private authService: AuthService) { }

  ngOnInit() {
    let i;
    for (i = 0; i < 50; i++) {
      this.originalRowData.push({ id: "A", name: "Test", number: 1 })
      this.renderedRows.push({ id: "A", name: "Test", number: 1 })
    }
    for (i = 0; i < 50; i++) {
      this.originalRowData.push({ id: "A", name: "Lea", number: 0 })
      this.renderedRows.push({ id: "A", name: "Lea", number: 0 })
    }
    this.fetchProgrammedEmailList();
    this.emailService.getUpdateProgrammedEmailObservable().subscribe(
      info => {
        if (info) {
          let index = this.programmedEmailList.findIndex(object => object.id == info.id);
          if (index != -1) {
            this.programmedEmailList[index] = info;
          } else {
            this.programmedEmailList.push(info);
          }
        }
      }
    );
  }

  ngAfterViewInit() {
    this.checkOverflow();
    this.checkBelow();
  }

  checkOverflow() {
    if (this.emailViewRows.nativeElement.scrollHeight > this.emailViewRows.nativeElement.clientHeight) {
      this.emailViewFilters.nativeElement.style.maxWidth = `calc(100% - 9px)`;
    } else {
      this.emailViewFilters.nativeElement.style.maxWidth = '100%';
    }
  }

  checkBelow(){
    if (this.belowRows.nativeElement.scrollHeight > this.belowRows.nativeElement.clientHeight) {
      this.belowFilters.nativeElement.style.maxWidth = `calc(100% - 9px)`;
    } else {
      this.belowFilters.nativeElement.style.maxWidth = '100%';
    }
  }

  openProgrammedEmail(programmedEmail: any) {
    // Open a programmed email modal after clicking it
    programmedEmail.appUsser = this.authService.getUser().id()!;
    this.emailService.setSelectedEmail(programmedEmail);
  }

  async fetchProgrammedEmailList() {
    // Fetch programmed emails if authService are present
    let usserId = this.authService.getUser().id();
    if (usserId == "") {
      return;
    }
    let fetchProgrammedEmails = await fetch("http://localhost:8080/api/programmedemail/" + this.authService.getUser().id(), {
      method: "GET",
      headers: {
        "Authorization": "Basic " + btoa(this.authService.getUser().email() + ":" + this.authService.getUser().password()),
        "Accept": "application/json",
        "Origin": "https://leandrocz15.github.io/",
      }
    });
    this.programmedEmailList = await fetchProgrammedEmails.json();
  }

  // Function to keep track of rows using the index given by the *ngFor
  trackByFn(index: number, item: any): number {
    return index;
  }

  // Function to sync the hidden column filters scroll with the list scroll

  //revisar aca que tal vez no haga falta la condicion
  syncScroll(isListScroll: number) {
    if (isListScroll) {
      this.emailViewFilters.nativeElement.scrollLeft = this.emailViewRows.nativeElement.scrollLeft;
    } else {
      this.emailViewRows.nativeElement.scrollLeft = this.emailViewFilters.nativeElement.scrollLeft;
    }
  }

  // Function to drop the filter column
  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.filters, event.previousIndex, event.currentIndex);
      // Swap the input values in the input fields of the columns. Since this doesn't work automatically
      let previousInput = document.getElementById("emailview_input_" + event.previousIndex) as HTMLInputElement;
      let currentInput = document.getElementById("emailview_input_" + event.currentIndex) as HTMLInputElement;
      let aux = currentInput.value;
      currentInput.value = previousInput.value;
      previousInput.value = aux;
      this.reloadRowView();
    }
  }

  // Function to re-render view when re-ordering columns. If the values are not set with timeout, the screen could flick
  reloadRowView() {
    setTimeout(() => this.reload = false);
    setTimeout(() => this.reload = true);
  }

  // Function to re-order columns. This will search the index of the key in the filters box array
  sortKeys = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return this.filters.findIndex(filter => filter.name === a.key.toString()) > this.filters.findIndex(filter => filter.name === b.key.toString()) ? 1 : -1;
  }

  filterRows(indexOfFilter: number, inputValue: string): void {
    // Avoid algorithm executing if the input is the same
    if (this.filters.at(indexOfFilter).value === inputValue) {
      return;
    }
    let trimedUnput = inputValue.trim();
    let currentInputOperator = trimedUnput.match(/<=|>=|<|>/);
    if (null !== currentInputOperator) {
      // Special filters should always be before the actual input
      if (currentInputOperator.index != 0) {
        alert("Si ustedes desea utilizar filtros especiales para este campo, porfavor coloque los caracteres especiales primero");
        return;
      }
      let realInputValue = trimedUnput.slice(currentInputOperator[0].length, undefined);
      let parsedToNumber = parseFloat(realInputValue);
      // Specials filters are not compatible with plain text
      if (isNaN(parsedToNumber)) {
        alert("Los filtros especiales no son compatibles con cadenas de texto planas");
        return;
      }
    }
    // Change current value of input in the filters box array
    this.filters.at(indexOfFilter).value = trimedUnput;
    // New auxiliary array to avoid making changes to this.renderedRows in every loop (so angular doesn't re-render the template in every loop)
    let newArray = this.originalRowData.filter(row => {
      return this.filters.every(filter => {
        if ('' !== filter.value) {
          const operatorMatch = filter.value.match(/<=|>=|<|>/);
          if (operatorMatch !== null) {
            const operator = operatorMatch[0];
            const valueParsed = parseFloat(filter.value.slice(operator.length));
            return this.operatorMap[operator](row[filter.name], valueParsed);
          } else {
            return (row[filter.name] as string)
              .toLowerCase()
              .includes((filter.value as string).toLowerCase());
          }
        }
        return true; // No filter applied if filter value is null
      });
    });
    this.renderedRows = newArray;
  }

  startDragging(event: MouseEvent) {
    this.isDragging = true;
    this.starterPosition = event.clientY;
    this.starterHeight = this.footer.nativeElement.clientHeight;
  }

  stopDragging() {
    this.isDragging = false;
  }


  test(event: MouseEvent) {
    if (this.isDragging && event.movementY !== 0) {
      this.footer.nativeElement.style.height = this.scrollOffset + this.starterHeight + (this.starterPosition - event.clientY) + "px";
    }
  }
}
