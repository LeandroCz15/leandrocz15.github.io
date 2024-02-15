import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { CazzeonService } from 'src/app/cazzeon-service/cazzeon-service';
import { HQL_PROPERTY, HttpMethod } from 'src/application-constants';
import { PaginationComponent, PaginationEventType } from '../pagination/pagination.component';
import { TabData } from '../../interfaces/tab-structure';
import { indexArrayByProperty } from 'src/application-utils';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})
export class GridComponent implements OnInit, OnDestroy {

  /********************** COMPONENT ATTRIBUTES **********************/
  public rows: any[] = []; // Rows of the current grid to render
  public reload: boolean = true; // Boolean used to re-render the view after changing the order in the rows columns
  public currentGridFieldsIndexedByHqlProperty: any = {}; // Indexed fields to make key sorting algorithm faster while rendering row properties

  /********************** INPUTS **********************/
  @Input() tabData!: TabData;
  @Input() paginationComponent!: PaginationComponent;

  /********************** SUBJECTS  **********************/
  @Input() reloadViewSubject!: Subject<void>;
  @Input() doFetchSubject!: Subject<number | undefined>;

  /********************** SUBSCRIPTIONS  **********************/
  private reloadViewSubscription!: Subscription;
  private doFetchSubscription!: Subscription;

  constructor(private cazzeonService: CazzeonService) { }

  ngOnInit(): void {
    this.currentGridFieldsIndexedByHqlProperty = indexArrayByProperty(this.tabData.gridFields, HQL_PROPERTY);
    this.doFirstFetch();
    this.reloadViewSubscription = this.reloadViewSubject.asObservable().subscribe(() => this.reloadView());
    this.doFetchSubscription = this.doFetchSubject.asObservable().subscribe(action => this.doFetch(action));
  }

  ngOnDestroy(): void {
    this.reloadViewSubscription.unsubscribe();
    this.doFetchSubscription.unsubscribe();
  }

  /**
   * Do fetch when initializing. This fetch shouldn't have a where clase
   */
  doFirstFetch(): void {
    const url: string = `api/data/retrieve/${this.tabData.tab.entityName}?mainTabId=${this.tabData.tab.id}`;
    this.cazzeonService.request(url, HttpMethod.POST, this.successFetch.bind(this), this.errorFetch.bind(this), (error: any) => {
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
    const fetchSize: number = this.paginationComponent.currentFetchSize;
    const url: string = `api/data/retrieve/${this.tabData.tab.entityName}?limit=${fetchSize}&mainTabId=${this.tabData.tab.id}`;
    const requestBody: any = { filters: this.tabData.gridFields };
    requestBody.paginationInfo = {
      action: paginationAction || PaginationEventType.RELOAD,
      previousFetchFirstId: this.paginationComponent.getPreviousFetchFirstId(),
      currentFetchFirstId: this.paginationComponent.getCurrentFetchFirstId(),
      currentFetchLastId: this.paginationComponent.getCurrentFetchLastId(),
    }
    this.cazzeonService.request(url, HttpMethod.POST, this.successFetch.bind(this), this.errorFetch.bind(this), (error: any) => {
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
    this.paginationComponent.setPreviousFetchFirstId(this.paginationComponent.getCurrentFetchFirstId());
  }

  // Update current fetch values of the pagination component
  updateCurrentFetchValues(): void {
    if (this.rows.length <= 0) {
      this.paginationComponent.setCurrentFetchFirstId("");
      this.paginationComponent.setCurrentFetchLastId("");
      return;
    }
    const firstRow = this.rows.at(0);
    const lastRow = this.rows.at(this.rows.length - 1);
    if (!firstRow.id || !lastRow.id) {
      console.error("The current fetch did not retrieve rows with an id. Pagination component will not work properly!");
    } else {
      this.paginationComponent.setCurrentFetchFirstId(firstRow.id);
      this.paginationComponent.setCurrentFetchLastId(lastRow.id);
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
