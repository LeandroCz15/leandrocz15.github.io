import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ViewComponent } from '../view/view.component';
import { AuthService } from 'src/app/login-module/auth-service';
import { HttpMethod } from 'src/application-constants';
import { PaginationEventType } from '../pagination/pagination.component';
import { FetchRowsService } from '../services/fetch-rows.service';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})
export class GridComponent implements OnInit, OnDestroy {

  // Boolean used to re-render the view after changing the order in the rows columns
  public reload: boolean = true;

  // Every row loaded in memory
  public rows: any[] = [];

  // Subscription for fetch rows service
  private fetchRowsSubscription!: Subscription;

  // View component reference
  @Input() viewComponent!: ViewComponent;

  // Service to reload the view. HEREDATED FROM PARENT
  @Input() reloadViewSubject!: Subject<void>;
  private reloadViewSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private fetchRows: FetchRowsService,
  ) { }

  ngOnInit(): void {
    this.doFirstFetch();
    this.reloadViewSubscription = this.reloadViewSubject.asObservable().subscribe(() => this.reloadView());
    this.fetchRowsSubscription = this.fetchRows.getFetchObservable().subscribe(action => this.doFetch(action));
  }

  ngOnDestroy(): void {
    this.reloadViewSubscription.unsubscribe();
    this.fetchRowsSubscription.unsubscribe();
  }

  // Only in OnInit. The first fetch should not have a where clause
  doFirstFetch(): void {
    const url: string = `api/data/retrieve/${this.viewComponent.mainTabEntityName}?limit=${this.viewComponent.paginationComponent.currentFetchSize}&mainTabId=${this.viewComponent.mainTabId}`;
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
    const fetchSize: number = this.viewComponent.paginationComponent?.currentFetchSize;
    const url: string = `api/data/retrieve/${this.viewComponent.mainTabEntityName}?limit=${fetchSize}&mainTabId=${this.viewComponent.mainTabId}`;
    const requestBody: any = { filters: this.viewComponent.gridFields.filter(field => field.showInGrid) };
    requestBody.paginationInfo = {
      action: paginationAction || PaginationEventType.RELOAD,
      previousFetchFirstId: this.viewComponent.paginationComponent.getPreviousFetchFirstId(),
      currentFetchFirstId: this.viewComponent.paginationComponent.getCurrentFetchFirstId(),
      currentFetchLastId: this.viewComponent.paginationComponent.getCurrentFetchLastId(),
    }
    this.authService.fetchInformation(url, HttpMethod.POST, this.successFetch.bind(this), this.errorFetch.bind(this), (error: any) => {
      console.error("Timeout when fetching rows");
    },
      JSON.stringify(requestBody));
  }

  // Executed when fetch is successfull
  async successFetch(response: Response): Promise<void> {
    const newRows = await response.json();
    this.rows = newRows;
    this.updateLastFetchValues();
    this.updateCurrentFetchValues();
  }

  // Executed when fetch failed
  async errorFetch(response: Response): Promise<void> {
    console.error(await response.text())
    this.rows.splice(0);
    this.updateLastFetchValues();
    this.updateCurrentFetchValues();
  }

  // Update last row id of last fetch in the PaginationComponent
  updateLastFetchValues(): void {
    this.viewComponent.paginationComponent.setPreviousFetchFirstId(this.viewComponent.paginationComponent.getCurrentFetchFirstId());
  }

  // Update current fetch values of the pagination component
  updateCurrentFetchValues(): void {
    if (this.rows.length <= 0) {
      this.viewComponent.paginationComponent.setCurrentFetchFirstId("");
      this.viewComponent.paginationComponent.setCurrentFetchLastId("");
      return;
    }
    const firstRow = this.rows.at(0);
    const lastRow = this.rows.at(this.rows.length - 1);
    if (!firstRow.id || !lastRow.id) {
      console.error("The current fetch did not retrieve rows with an id. Pagination component will not work properly!");
    } else {
      this.viewComponent.paginationComponent.setCurrentFetchFirstId(firstRow.id);
      this.viewComponent.paginationComponent.setCurrentFetchLastId(lastRow.id);
    }
  }

  // Forces angular to re-draw the view. This is needed when a column swamp places with another in the headers
  reloadView(): void {
    setTimeout(() => this.reload = false);
    setTimeout(() => this.reload = true);
  }

  // Function to keep track of rows using the index given by the *ngFor
  trackByFn(index: number, item: any): number {
    return index;
  }

}
