import { AfterViewInit, Component, ComponentRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription, filter } from 'rxjs';
import { HeaderComponent } from '../header/header.component';
import { GridComponent } from '../grid/grid.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { AuthService } from 'src/app/login-module/auth-service';
import { SelectPageService } from '../services/select-page.service';
import { HttpMethod } from 'src/application-constants';
import { indexArrayByProperty } from 'src/application-utils';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ContextMenuComponent, ContextMenuItem } from '../context-menu/context-menu.component';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit, OnDestroy {

  // View id of this view component
  public viewId: string = "";

  // Main tab id of this view component
  public mainTabId: string = "";

  // Entity name of the main tab
  public mainTabEntityName: string = "";

  // Boolean used to render the child components once the main fetch is done
  public viewReady: boolean = false;

  // Fields to show in the grid of the current tab
  public gridFields: any[] = [];

  // Fields to show in the form of the current tab
  public formFields: any[] = [];

  // Indexed fields to show in the grid for better performance
  public currentGridFieldsIndexedByHqlProperty: any = {};

  // Indexed fields to show in the form for better performance
  public currentFormFieldsIndexedByHqlProperty: any = {};

  // Array of items of the context menu to show in this view. Buid in this component to reuse and not build on every right click
  public contextMenuItems: ContextMenuItem[] = [];

  // Service to reload the view
  public reloadViewSubject: Subject<void> = new Subject<void>;

  // Subscription for page change service
  private pageChangeSubscription!: Subscription;

  // Buttons and process of the main tab
  private buttonsAndProcess: any[] = [];

  // Header children component
  @ViewChild(HeaderComponent) headerComponent!: HeaderComponent;

  // Grid children component
  @ViewChild(GridComponent) gridComponent!: GridComponent;

  // Pagination children component
  @ViewChild(PaginationComponent) paginationComponent!: PaginationComponent;

  constructor(
    private authService: AuthService,
    private pageChangeService: SelectPageService
  ) { }

  ngOnInit(): void {
    this.pageChangeSubscription = this.pageChangeService.getPageChangeObservable().subscribe(viewId => {
      this.viewReady = false;
      this.viewId = viewId;
      this.fetchMainTabInformation();
    });
  }

  ngOnDestroy(): void {
    this.pageChangeSubscription.unsubscribe();
  }

  /**
   * This function fetch the main tab information
   */
  fetchMainTabInformation() {
    this.authService.fetchInformation(`api/data/view?viewId=${this.viewId}`, HttpMethod.GET, async (response: Response) => {
      this.processMainTabInformation(await response.json());
      // TODO: BOTH ARRAYS STARTS FROM THE SAME. TRY TO INDEX BOTH TO AVOID TRAVELING THE LIST SO MANY TIMES
      this.currentGridFieldsIndexedByHqlProperty = indexArrayByProperty(this.gridFields, "hqlProperty");
      this.currentFormFieldsIndexedByHqlProperty = indexArrayByProperty(this.formFields, "hqlProperty");
      this.viewReady = true;
    }, async (response: Response) => {
      console.error(`Error while fetching data of the view with id: ${this.viewId}. Error: ${await response.text()}`);
    }, (error: any) => {
      console.error("Error while fetching main tab information");
    });
  }

  /**
   * This function process all the view data retrieved and sets the correspondent variables
   * 
   * @param data View fetch data
   */
  processMainTabInformation(viewData: any) {
    this.mainTabId = viewData.id;
    this.mainTabEntityName = viewData.entityName;
    this.constructMenuItems(viewData.buttonAndProcess);
    this.constructFieldsAndHeaders(viewData.fields);
  }

  /**
   * 
   * @param fields Properties of the entity to construct the header and form
   */
  constructFieldsAndHeaders(fields: any[]): void {
    const newGridFields: any[] = [];
    const newFormFields: any[] = [];
    fields.forEach((field: any) => {
      field.lastValueUsedForSearch = undefined;
      field.value = undefined;
      if (field.showInGrid) {
        newGridFields.push(field);
      }
      if (field.showInForm) {
        newFormFields.push(field);
      }
    });
    this.gridFields = newGridFields;
    this.formFields = newFormFields;
  }

  /**
   * Construct the items of the context menu. This is made in the view component because the buttons and process are view related
   * @param items Items from response. This items needs to be converted into ContextMenuItem interface
   */
  constructMenuItems(items: any[]): void {
    const deleteFunction = this.authService.deleteRows.bind(this.authService);
    const executeProcessFunction = this.authService.executeProcess.bind(this.authService);
    const viewComponent = this;
    const actionMenuItems: ContextMenuItem[] = items.map(function (obj) {
      return {
        label: obj.name,
        imageSource: obj.iconSource,
        clickFn(row: any, item: any) {
          executeProcessFunction(row, item);
        },
        //items: [{label: "HOLA", imageSource: "asd"}]
      }
    });
    this.contextMenuItems = [
      {
        label: "Actions", imageSource: "bi-cpu", items: actionMenuItems
      },
      {
        label: "Delete", imageSource: "bi-trash", clickFn(row, item) {
          deleteFunction(viewComponent, [row]);
        }
      }
    ];
  }

  /**
   * Function to handle the logic when dragging and dropping a header of the current view
   * 
   * @param event Drag and drop event
   */
  dropFilterColumn(event: CdkDragDrop<any[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.gridFields, event.previousIndex, event.currentIndex);
      this.currentGridFieldsIndexedByHqlProperty = indexArrayByProperty(this.gridFields, "hqlProperty");
      this.reloadViewSubject.next();
    }
  }

}
