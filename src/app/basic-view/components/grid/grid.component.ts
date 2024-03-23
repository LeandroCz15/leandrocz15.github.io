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
  @Input() doFetchSubject!: Subject<PaginationEventType>;

  /********************** SUBSCRIPTIONS  **********************/
  private reloadViewSubscription!: Subscription;
  private doFetchSubscription!: Subscription;

  constructor(private cazzeonService: CazzeonService) { }

  ngOnInit(): void {
    this.currentGridFieldsIndexedByHqlProperty = indexArrayByProperty(this.tabData.gridFields, HQL_PROPERTY);
    this.reloadViewSubscription = this.reloadViewSubject.asObservable().subscribe(() => this.reloadView());
    this.doFetchSubscription = this.doFetchSubject.asObservable().subscribe(action => this.doFetch(action));
    this.doFirstFetch();
  }

  ngOnDestroy(): void {
    this.reloadViewSubscription.unsubscribe();
    this.doFetchSubscription.unsubscribe();
  }

  /**
   * This function will do the first fetch of the data while initializing the view.
   * 
   * This first fetch doesn't have any filters at the moment
   */
  doFirstFetch(): void {
    const url: string = `api/entity/retrieve/${this.tabData.tab.entityName}?mainTabId=${this.tabData.tab.id}`;
    const parentConnector: any = this.tabData.clickedRow ? { parentId: this.tabData.clickedRow.id, parentConnectorProperty: this.tabData.tab.hqlConnectionProperty } : undefined;
    this.cazzeonService.request(url, HttpMethod.POST, this.successFetch.bind(this), this.errorFetch.bind(this), this.timeoutFetch.bind(this), JSON.stringify({ parentConnector: parentConnector }));
  }

  /**
   * This function will fetch rows with using the data of it's siblings components.
   * 
   * For example: Pagination size, tab filters, etc.
   * 
   * @param paginationAction Action to do (FETCH NEXT, BACK OR RELOAD)
  */
  doFetch(paginationAction: PaginationEventType): void {
    const fetchSize: number = this.paginationComponent.currentFetchSize;
    const url: string = `api/entity/retrieve/${this.tabData.tab.entityName}?limit=${fetchSize}&mainTabId=${this.tabData.tab.id}`;
    const parentConnector: any = this.tabData.clickedRow ? {
      parentId: this.tabData.clickedRow.id,
      parentConnectorProperty: this.tabData.tab.hqlConnectionProperty
    } : undefined;
    const paginationData: any = {
      action: paginationAction,
      previousFetchFirstId: this.paginationComponent.getPreviousFetchFirstId(),
      currentFetchFirstId: this.paginationComponent.getCurrentFetchFirstId(),
      currentFetchLastId: this.paginationComponent.getCurrentFetchLastId(),
    };
    const body: any = { filters: this.tabData.gridFields, parentConnector: parentConnector, paginationData: paginationData };
    this.cazzeonService.request(url, HttpMethod.POST, this.successFetch.bind(this), this.errorFetch.bind(this), this.timeoutFetch.bind(this),
      JSON.stringify(body));
  }

  /**
   * Executed when the response is OK
   * 
   * @param response Response of the request
   */
  async successFetch(response: Response): Promise<void> {
    this.rows = await response.json();
    this.updateLastFetchValues();
    this.updateCurrentFetchValues();
  }

  /**
   * Executed when the response is not OK
   * 
   * @param response Response of the request
   */
  async errorFetch(response: Response): Promise<void> {
    console.error(await response.text())
    this.rows.splice(0);
    this.updateLastFetchValues();
    this.updateCurrentFetchValues();
  }

  /**
   * Executed when timeout while fetching data
   * 
   * @param error 
   */
  timeoutFetch(error: any): void {
    console.error("Timeout while fetching data");
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
