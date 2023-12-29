import { KeyValue } from '@angular/common';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ViewComponent } from '../view/view.component';
import { AuthService } from 'src/app/login-module/auth-service';
import { HttpMethod } from 'src/application-constants';
import { PaginationEventType } from '../pagination/pagination.component';
import { OpenFormService } from '../services/open-form.service';
import { FetchRowsService } from '../services/fetch-rows.service';

@Component({
  selector: 'app-rows',
  templateUrl: './rows.component.html',
  styleUrls: ['./rows.component.css']
})
export class RowsComponent implements OnInit, OnDestroy {

  // View component reference
  @Input() viewComponent!: ViewComponent;

  // Service to reload the view. HEREDATED FROM PARENT
  @Input() reloadViewSubject!: Subject<void>;
  private reloadViewSubscription!: Subscription;

  // Subscription for fetch rows service
  private fetchRowsSubscription!: Subscription;

  // Boolean used to re-render the view after changing the order in the rows columns
  public reload: boolean = true;

  // Rows to show in the template
  public rows: Array<any> = new Array<any>;

  constructor(private authService: AuthService, private openForm: OpenFormService, private fetchRows: FetchRowsService) { }

  ngOnInit(): void {
    this.doFirstFetch();
    this.reloadViewSubscription = this.reloadViewSubject.asObservable().subscribe(() => this.reloadView());
    this.fetchRowsSubscription = this.fetchRows.getFetchObservable().subscribe(action => this.doFetch(action));
  }

  ngOnDestroy(): void {
    this.reloadViewSubscription.unsubscribe();
    this.fetchRowsSubscription.unsubscribe();
  }

  openRowInFormMode(row: any): void {
    this.openForm.sendRowChange(Object.assign({}, row));
  }

  // Only in OnInit. The first fetch should not have a where clause
  doFirstFetch(): void {
    let url: string = `api/data/retrieve/${this.viewComponent.mainTabEntityName}?limit=${50}&mainTabId=${this.viewComponent.mainTabId}`;
    this.authService.fetchInformation(url, HttpMethod.POST, this.successFetch.bind(this), this.errorFetch.bind(this), (error: any) => {
      console.error("Timeout when fetching rows");
    });
  }

  /**
   * Fetch rows of the entity in the current tab parent
   * 
   * @param paginationInfo 
   *  Object containing information about the pagination to fetch data. If this object is null then the where clause wont have a entity id filter
  */
  doFetch(paginationAction?: number): void {
    // Update last row id in the pagination component before fetching more data
    this.updateLastRowId();
    const fetchSize: number = this.viewComponent.paginationComponent?.currentFetchSize;
    const url: string = `api/data/retrieve/${this.viewComponent.mainTabEntityName}?limit=${fetchSize}&mainTabId=${this.viewComponent.mainTabId}`;
    const requestBody: any = { filters: this.viewComponent.currentTabFilters };
    requestBody.paginationInfo = {
      action: paginationAction || PaginationEventType.RELOAD,
      previousFetchLastId: this.viewComponent.paginationComponent.getPreviousFetchLastId(),
      currentFetchFirstId: this.viewComponent.paginationComponent.getCurrentFetchFirstId()
    }
    this.authService.fetchInformation(url, HttpMethod.POST, this.successFetch.bind(this), this.errorFetch.bind(this), (error: any) => {
      console.error("Timeout when fetching rows");
    },
      JSON.stringify(requestBody));
  }

  // Executed when fetch is successfull
  async successFetch(response: Response): Promise<void> {
    let lastRowLength: number = this.rows.length;
    this.rows = await response.json();
    // Update first row id in the pagination component after fetching data
    this.updateFirstRowId();
  }

  // Executed when fetch failed
  async errorFetch(response: Response): Promise<void> {
    console.error(await response.text())
    let lastRowLength: number = this.rows.length;
    this.rows = [];
    this.updateFirstRowId();
  }

  // Update last row id of last fetch in the PaginationComponent
  updateLastRowId(): void {
    if (this.rows.length <= 0) {
      this.viewComponent.paginationComponent.setPreviousFetchLastId("");
      return;
    }
    let lastRow = this.rows.at(this.rows.length - 1);
    if (!lastRow.id) {
      console.error("The current fetch did not retrieve the last row with the id property. Pagination component will not work properly");
      this.viewComponent.paginationComponent.setPreviousFetchLastId("");
    } else {
      this.viewComponent.paginationComponent.setPreviousFetchLastId(lastRow.id);
    }
  }

  // Update first row id of current fetch in the PaginationComponent
  updateFirstRowId(): void {
    if (this.rows.length <= 0) {
      this.viewComponent.paginationComponent.setCurrentFetchFirstId("");
      return;
    }
    let firstRow = this.rows.at(0);
    if (!firstRow.id) {
      console.error("The current fetch did not retrieve the first row with the id property. Pagination component will not work properly");
      this.viewComponent.paginationComponent.setCurrentFetchFirstId("");
    } else {
      this.viewComponent.paginationComponent.setCurrentFetchFirstId(firstRow.id);
    }
  }

  // Forces angular to re-draw the view. This is needed when a column swamp places with another in the headers
  reloadView(): void {
    setTimeout(() => this.reload = false);
    setTimeout(() => this.reload = true);
  }

  // Pipe to sort keys of the rows
  sortKeys = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return this.viewComponent.currentTabFiltersIndexedByHqlProperty[a.key].sequence > this.viewComponent.currentTabFiltersIndexedByHqlProperty[b.key].sequence ? 1 : -1;
  }

  // Function to keep track of rows using the index given by the *ngFor
  trackByFn(index: number, item: any): number {
    return index;
  }

}
