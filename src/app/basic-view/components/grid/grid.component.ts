import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { CazzeonService } from 'src/app/cazzeon-service/cazzeon-service';
import { HQL_PROPERTY, HttpMethod } from 'src/application-constants';
import { PaginationComponent, PaginationEventType } from '../pagination/pagination.component';
import { ServerResponse, indexArrayByProperty } from 'src/application-utils';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { TabData } from '../view/view.component';

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

  constructor(private cazzeonService: CazzeonService, private snackbar: SnackbarService) { }

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
    const url: string = `api/entity/retrieve/${this.tabData.tab.entityName}`;
    const parentConnector: any = this.tabData.clickedRow ? { parentId: this.tabData.clickedRow.id, parentConnectorProperty: this.tabData.tab.hqlConnectionProperty } : undefined;
    this.cazzeonService.request(url,
      HttpMethod.POST,
      async (response: Response) => {
        const jsonResponse: ServerResponse = await response.json();
        this.rows = jsonResponse.body;
        this.updateCurrentFetchValues();
      },
      this.errorFetch.bind(this),
      this.timeoutFetch.bind(this),
      JSON.stringify({ gridFields: this.tabData.gridFields, formFields: this.tabData.formFields, parentConnector: parentConnector }));
  }

  /**
   * This function will fetch rows with using the data of it's siblings components.
   * 
   * For example: Pagination size, tab filters, etc.
   * 
   * @param paginationAction Action to do (FETCH NEXT, BACK OR RELOAD)
  */
  doFetch(paginationEvent: PaginationEventType): void {
    const fetchSize: number = this.paginationComponent.currentFetchSize;
    const url: string = `api/entity/retrieve/${this.tabData.tab.entityName}?limit=${fetchSize}`;
    const parentConnector: any = this.tabData.clickedRow ? {
      parentId: this.tabData.clickedRow.id,
      parentConnectorProperty: this.tabData.tab.hqlConnectionProperty
    } : undefined;
    const paginationData: any = {
      action: paginationEvent,
      firstId: this.paginationComponent.firstId,
      lastId: this.paginationComponent.lastId,
    };
    this.cazzeonService.request(url,
      HttpMethod.POST,
      async (response: Response) => {
        const jsonResponse: ServerResponse = await response.json();
        if (jsonResponse.body.length === 0 && paginationEvent !== PaginationEventType.RELOAD) {
          // NOT RESULTS WHILE FETCHING NEXT OR BACK. JUST SHOW SNACKBAR
          this.snackbar.showSuccess("No more data to show");
          return;
        }
        this.rows = jsonResponse.body;
        this.updateCurrentFetchValues();
      },
      this.errorFetch.bind(this),
      this.timeoutFetch.bind(this),
      JSON.stringify({ gridFields: this.tabData.gridFields, formFields: this.tabData.formFields, parentConnector: parentConnector, paginationData: paginationData }));
  }

  /**
   * Executed when the response is not OK
   * 
   * @param response Response of the request
   */
  async errorFetch(response: Response): Promise<void> {
    this.rows.splice(0);
    this.updateCurrentFetchValues();
    const jsonResponse: ServerResponse = await response.json();
    console.error(`The fetch for data of the entity ${this.tabData.tab.entityName} went wrong: ${jsonResponse.message}`);
  }

  /**
   * Executed when timeout while fetching data
   * 
   * @param error 
   */
  timeoutFetch(error: TypeError): void {
    console.error(`Unexpected error while fetching data: ${error.message}`);
  }

  // Update current fetch values of the pagination component
  updateCurrentFetchValues(): void {
    const firstRowId = this.rows.at(0)?.id;
    const lastRowId = this.rows.at(this.rows.length - 1)?.id;
    this.paginationComponent.firstId = firstRowId;
    this.paginationComponent.lastId = lastRowId;
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
