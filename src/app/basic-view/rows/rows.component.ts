import { KeyValue } from '@angular/common';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { PaginationEventType } from '../pagination/pagination.component';
import { ViewComponent } from '../view/view.component';
import { AuthService, HttpMethod } from 'src/app/login-module/auth-service';

@Component({
  selector: 'app-rows',
  templateUrl: './rows.component.html',
  styleUrls: ['./rows.component.css']
})
export class RowsComponent implements OnInit, OnDestroy {

  // View component reference
  @Input() viewComponent!: ViewComponent;

  // Row container of the template of this controller
  @ViewChild("rowContainer") rowContainer!: ElementRef;

  // Service to reload the view. HEREDATED FROM PARENT
  @Input() reloadViewSubject!: Subject<ElementRef>;
  private reloadViewSubscription!: Subscription;

  // Service to handle input change in the filters. HEREDATED FROM PARENT
  @Input() handleInputChangeSubject!: Subject<any[]>;
  private handleInputChangeSubscription!: Subscription;

  // Service to fetch data when the user interacts with the pagination component. HEREDATED FROM PARENT
  @Input() paginationChangeSubject!: Subject<any>;
  private paginationChangeSubscription!: Subscription;

  // Boolean used to re-render the view after changing the order in the rows columns
  public reload: boolean = true;

  // Rows to show in the template
  public rows: Array<any> = new Array<any>;

  // Object with properties in their correspondent order to make the sort algorithm faster
  private sortObject: any;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.doFirstFetch();
    this.reloadViewSubscription = this.reloadViewSubject.asObservable().subscribe(info => this.reloadView(info));
    this.handleInputChangeSubscription = this.handleInputChangeSubject.asObservable().subscribe(() => this.fetchRows(null));
    this.paginationChangeSubscription = this.paginationChangeSubject.asObservable().subscribe(info => this.fetchRows(info));
  }

  ngOnDestroy(): void {
    this.reloadViewSubscription.unsubscribe();
    this.handleInputChangeSubscription.unsubscribe();
    this.paginationChangeSubscription.unsubscribe();
  }

  // Only in OnInit. The first fetch should not have a where clause
  doFirstFetch(): void {
    let url: string = `api/data/retrieve/${this.viewComponent.mainTabEntityName}?limit=${50}&mainTabId=${this.viewComponent.mainTabId}`;
    this.authService.fetchInformation(url, HttpMethod.POST, this.successFetch.bind(this), this.errorFetch.bind(this));
  }

  /**
   * Fetch rows of the entity in the current tab parent
   * 
   * @param paginationInfo 
   *  Object containing information about the pagination to fetch data. If this object is null then the where clause wont have a entity id filter
  */
  fetchRows(paginationInfo: any): void {
    this.updateLastRowId();
    let fetchSize: number = this.viewComponent.paginationComponent ? this.viewComponent.paginationComponent.currentFetchSize : 50;
    let url: string = `api/data/retrieve/${this.viewComponent.mainTabEntityName}?limit=${fetchSize}&mainTabId=${this.viewComponent.mainTabId}`;
    this.authService.fetchInformation(url, HttpMethod.POST, this.successFetch.bind(this), this.errorFetch.bind(this), JSON.stringify(this.viewComponent.currentTabFilters));
  }

  // Executed when fetch is successfull
  async successFetch(response: Response): Promise<void> {
    let lastRowLength: number = this.rows.length;
    this.rows = await response.json();
    this.updateHeaderMaxWidth();
    this.updateFirstRowId();
    if (this.rows.length === lastRowLength) {
      //TODO: CHECK IF IT IS REALLY NECESSARY
      // If the row length is the same as before, maybe angular cant detect changes so it wont redraw object that maybe have been changed
      this.reloadView(null);
    }
  }

  // Executed when fetch failed
  async errorFetch(response: Response): Promise<void> {
    console.log(`Error while fetching data of entity ${this.viewComponent.mainTabEntityName}: ${await response.text()}. Error status: ${response.status}`);
    let lastRowLength: number = this.rows.length;
    this.rows = [];
    this.updateHeaderMaxWidth();
    this.updateFirstRowId();
    if (this.rows.length === lastRowLength) {
      //TODO: CHECK IF IT IS REALLY NECESSARY
      // If the row length is the same as before, maybe angular cant detect changes so it wont redraw object that maybe have been changed
      this.reloadView(null);
    }
  }

  // Update last row id of last fetch in the PaginationComponent
  updateLastRowId(): void {
    this.viewComponent.paginationComponent.setPreviousFetchLastId(this.rows.length > 0 ? this.rows.at(this.rows.length - 1).id : "");
  }

  // Update first row id of current fetch in the PaginationComponent
  updateFirstRowId(): void {
    this.viewComponent.paginationComponent.setCurrentFetchFirstId(this.rows.length > 0 ? this.rows.at(0).id : "");
  }

  /**
   * This function formulates a pagination clause with the pagination component information
   * 
   * @param paginationInfo Object containing the pagination information
   * 
   * @returns A string with a where clause to use for pagination
   */
  formulatePaginationClause(paginationInfo: any): string {
    switch (paginationInfo?.action) {
      case PaginationEventType.RELOAD:
        return this.viewComponent.paginationComponent.getCurrentFetchFirstId() ? `AND e.id >= '${this.viewComponent.paginationComponent.getCurrentFetchFirstId()}'` : "";
      case PaginationEventType.FETCH_NEXT:
        return this.viewComponent.paginationComponent.getPreviousFetchLastId() ? `AND e.id > '${this.viewComponent.paginationComponent.getPreviousFetchLastId()}'` : "";
      case PaginationEventType.FETCH_BACK:
        return this.viewComponent.paginationComponent.getCurrentFetchFirstId() ? `AND e.id <= '${this.viewComponent.paginationComponent.getCurrentFetchFirstId()}'` : "";
      default:
        return "";
    }
  }

  // Sync the scroll of the rows container to the scroller of the filters container, since the scroller of the filters container is invisible
  syncScroll(): void {
    this.viewComponent.headerComponent.filterContainer.nativeElement.scrollLeft = this.rowContainer.nativeElement.scrollLeft;
  }

  // Update the header component max width to fit properly when the rows have been overflowed
  updateHeaderMaxWidth(): void {
    if (this.rowContainer.nativeElement.scrollHeight > this.rowContainer.nativeElement.clientHeight) {
      this.viewComponent.headerComponent.filterContainer.nativeElement.style.maxWidth = `calc(100% - 9px)`;
    } else {
      this.viewComponent.headerComponent.filterContainer.nativeElement.style.maxWidth = '100%';
    }
  }

  // Forces angular to re-draw the view
  reloadView(info: any): void {
    /* 
      Set sortObject for better performance when sorting keys of the rows. This object is created when
      the HeaderComponent detect a drag and drop in the filters. It should only be passed when drag and drop in the HeaderComponent.
      Otherwise pass null as parameter
    */
    if (info) {
      this.sortObject = info
    }
    // Use timeout functions to make Angular re-render the view
    setTimeout(() => this.reload = false);
    setTimeout(() => this.reload = true);
  }

  // Pipe to sort keys of the rows
  sortKeys = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    if (!this.sortObject) {
      return 0;
    }
    return this.sortObject[a.key] > this.sortObject[b.key] ? 1 : -1;
  }

  // Function to keep track of rows using the index given by the *ngFor
  trackByFn(index: number, item: any): number {
    return index;
  }

}
