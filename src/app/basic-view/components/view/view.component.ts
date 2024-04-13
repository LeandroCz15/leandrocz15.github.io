import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { GridComponent } from '../grid/grid.component';
import { CazzeonService } from 'src/app/cazzeon-service/cazzeon-service';
import { SelectPageService } from '../../services/select-page.service';
import { CONTEXT_MENU, HQL_PROPERTY, HttpMethod, TABS_MODAL } from 'src/application-constants';
import { ServerResponse, indexArrayByProperty } from 'src/application-utils';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ContextMenuItem } from '../context-menu/context-menu.component';
import { MatDialog } from '@angular/material/dialog';
import { TabComponent } from '../tab/tab.component';
import { TabData } from '../../interfaces/tab-structure'
import { PaginationEventType } from '../pagination/pagination.component';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit, OnDestroy {

  /********************** COMPONENT ATTRIBUTES **********************/
  public viewReady: boolean = false; // Boolean used to render the child components once the main fetch is done
  public mainTabData: TabData = {  // Details of the main tab
    contextMenuItems: [],
    formFields: [],
    gridFields: [],
    allFields: [],
    clickedRow: undefined,
    tab: undefined
  };

  /********************** SUBJECTS  **********************/
  public reloadViewSubject: Subject<void> = new Subject();
  public doFetchSubject: Subject<PaginationEventType> = new Subject();

  /********************** SUBSCRIPTIONS  **********************/
  private pageChangeSubscription!: Subscription;

  /********************** CHILD COMPONENTS  **********************/
  @ViewChild(GridComponent) gridComponent!: GridComponent;

  constructor(
    private cazzeonService: CazzeonService,
    private pageChangeService: SelectPageService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.pageChangeSubscription = this.pageChangeService.getPageChangeObservable().subscribe(viewId => {
      this.viewReady = false;
      this.fetchMainTabData(viewId);
    });
  }

  ngOnDestroy(): void {
    this.pageChangeSubscription.unsubscribe();
  }

  /**
   * Fetch information about the main tab of the current view
   */
  fetchMainTabData(viewId: string) {
    this.cazzeonService.request(`api/data/view?viewId=${viewId}`, HttpMethod.GET, async (response: Response) => {
      const jsonResponse: ServerResponse = await response.json();
      this.mainTabData.tab = jsonResponse.body.mainTab;
      this.constructMenuItems(jsonResponse.body);
      this.constructFields(jsonResponse.body.mainTab.fields);
      this.viewReady = true;
    }, async (response: Response) => {
      const jsonResponse: ServerResponse = await response.json();
      console.error(`Error while fetching data of the view: ${jsonResponse.message}`);
    }, (error: TypeError) => {
      console.error(`Error while initializing the view: ${error.message}`);
    });
  }

  /**
   * This function will construct the grid and form fields of the current view.
   * 
   * @param fields Properties of the entity to construct the header and form
   */
  constructFields(fields: any[]): void {
    const newGridFields: any[] = [];
    const newFormFields: any[] = [];
    fields.forEach(field => {
      field.lastValueUsedForSearch = undefined;
      field.value = undefined;
      if (field.showInGrid) {
        newGridFields.push(field);
      }
      if (field.showInForm) {
        newFormFields.push(field);
      }
      this.mainTabData.allFields.push(field);
    });
    this.mainTabData.gridFields = newGridFields;
    this.mainTabData.formFields = newFormFields;
  }

  /**
   * Construct the items of the context menu. This is made in the view component because the buttons and process are view related
   * @param items Items from response. This items needs to be converted into ContextMenuItem interface
   */
  constructMenuItems(viewData: any): void {
    const deleteFunction = this.cazzeonService.deleteRowsWithPaginationComponent.bind(this.cazzeonService);
    const viewComponent = this;
    this.mainTabData.contextMenuItems = [
      {
        label: CONTEXT_MENU.actionsLabel, imageSource: CONTEXT_MENU.actionsIcon, items: this.constructProcessItems(viewData.buttonAndProcess)
      },
      {
        label: CONTEXT_MENU.tabsLabel, imageSource: CONTEXT_MENU.tabsIcon, items: this.constructTabItems(viewData.tabs)
      },
      {
        label: CONTEXT_MENU.deleteLabel, imageSource: CONTEXT_MENU.deleteIcon, clickFn(row, item) {
          deleteFunction(viewComponent, [row]);
        }
      }
    ];
  }

  /**
   * Construct the items in the context menu that will contain
   * all the processes
   * 
   * @param items Object to construct the ContextMenuItem array
   * @returns Array of ContextMenuItem representing processes
   */
  constructProcessItems(items: any[]): ContextMenuItem[] {
    const executeProcessFunction = this.cazzeonService.executeProcess.bind(this.cazzeonService);
    return items.map(obj => {
      return {
        label: obj.name,
        imageSource: obj.iconSource,
        javaClass: obj.javaClass,
        clickFn(row: any, item: ContextMenuItem) {
          executeProcessFunction(row, item);
        },
      }
    });
  }

  /**
   * Construct the items in the context menu that will contain
   * all the tabs
   * 
   * @param items Object to construct the ContextMenuItem array
   * @returns Array of ContextMenuItem representing tabs
   */
  constructTabItems(items: any[]): ContextMenuItem[] {
    const openTabFunction = this.openTab.bind(this);
    return items.map(obj => {
      return {
        label: obj.name,
        imageSource: obj.iconSource,
        clickFn(row: any, item: ContextMenuItem) {
          openTabFunction(row, item);
        },
        tab: obj
      }
    });
  }

  /**
   * Open the selected tab
   * 
   * @param row Row from which the click was fired
   * @param item Selected item representing a tab
   */
  openTab(row: any, item: ContextMenuItem): void {
    this.dialog.open(TabComponent, {
      data: { clickedRow: row, tab: item.tab },
      height: TABS_MODAL.defaultHeight,
      width: TABS_MODAL.defaultWidth
    });
  }

  /**
   * Function to handle the logic when dragging and dropping a header of the current view
   * 
   * @param event Drag and drop event
   */
  dropFilterColumn(event: CdkDragDrop<any[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.mainTabData.gridFields, event.previousIndex, event.currentIndex);
      this.gridComponent.currentGridFieldsIndexedByHqlProperty = indexArrayByProperty(this.mainTabData.gridFields, HQL_PROPERTY);
      this.reloadViewSubject.next();
    }
  }

}