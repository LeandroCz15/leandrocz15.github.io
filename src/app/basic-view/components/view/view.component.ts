import { Component,OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { GridComponent } from '../grid/grid.component';
import { CazzeonService } from 'src/app/cazzeon-service/cazzeon-service';
import { SelectPageService } from '../../services/select-page.service';
import { HQL_PROPERTY, HttpMethod } from 'src/application-constants';
import { indexArrayByProperty } from 'src/application-utils';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ContextMenuItem } from '../context-menu/context-menu.component';
import { MatDialog } from '@angular/material/dialog';
import { TabComponent } from '../tab/tab.component';
import { TabData } from '../../interfaces/tab-structure'

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit, OnDestroy {

  /********************** COMPONENT ATTRIBUTES **********************/
  public viewId: string = "";
  public viewReady: boolean = false; // Boolean used to render the child components once the main fetch is done
  public mainTabData: TabData = {  // Details of the main tab
    contextMenuItems: [],
    formFields: [],
    gridFields: [],
    clickedRow: undefined,
    tab: undefined
  };

  /********************** SUBJECTS  **********************/
  public reloadViewSubject: Subject<void> = new Subject();
  public doFetchSubject: Subject<number | undefined> = new Subject();

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
      this.viewId = viewId;
      this.fetchMainTabInformation();
    });
  }

  ngOnDestroy(): void {
    this.pageChangeSubscription.unsubscribe();
  }

  /**
   * Fetch information about the main tab of the current view
   */
  fetchMainTabInformation() {
    this.cazzeonService.request(`api/data/view?viewId=${this.viewId}`, HttpMethod.GET, async (response: Response) => {
      this.processMainTabInformation(await response.json());
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
   * @param data View data
   */
  processMainTabInformation(viewData: any) {
    this.mainTabData.tab = viewData.mainTab;
    this.constructMenuItems(viewData);
    this.constructFieldsAndHeaders(viewData.mainTab.fields);
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
    this.mainTabData.gridFields = newGridFields;
    this.mainTabData.formFields = newFormFields;
  }

  /**
   * Construct the items of the context menu. This is made in the view component because the buttons and process are view related
   * @param items Items from response. This items needs to be converted into ContextMenuItem interface
   */
  constructMenuItems(viewData: any): void {
    const deleteFunction = this.cazzeonService.deleteRows.bind(this.cazzeonService);
    const gridComponent = this.gridComponent;
    this.mainTabData.contextMenuItems = [
      {
        label: "Actions", imageSource: "bi-cpu", items: this.constructProcessItems(viewData.buttonAndProcess)
      },
      {
        label: "Tabs", imageSource: "bi-journals", items: this.constructTabItems(viewData.tabs)
      },
      {
        label: "Delete", imageSource: "bi-trash", clickFn(row, item) {
          deleteFunction(gridComponent, [row]);
        }
      }
    ];
  }

  /**
   * Open the selected tab
   * @param row Row from which the click was fired
   * @param item Selected item representing a tab
   */
  openTab(row: any, item: ContextMenuItem): void {
    this.dialog.open(TabComponent, {
      data: { clickedRow: row, tab: item.tab },
      height: "80%",
      width: "80%"
    });
  }

  /**
   * Construct the items in the context menu that will contain
   * all the tabs
   * @param items Object to construct the ContextMenuItem array
   * @returns Array of ContextMenuItem representing tabs
   */
  constructTabItems(items: any[]): ContextMenuItem[] {
    const openTabFuncntion = this.openTab.bind(this);
    return items.map(function (obj) {
      return {
        label: obj.name,
        imageSource: obj.iconSource,
        clickFn(row: any, item: ContextMenuItem) {
          openTabFuncntion(row, item);
        },
        tab: obj
      }
    });
  }

  /**
   * Construct the items in the context menu that will contain
   * all the processes
   * @param items Object to construct the ContextMenuItem array
   * @returns Array of ContextMenuItem representing processes
   */
  constructProcessItems(items: any[]): ContextMenuItem[] {
    const executeProcessFunction = this.cazzeonService.executeProcess.bind(this.cazzeonService);
    return items.map(function (obj) {
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
