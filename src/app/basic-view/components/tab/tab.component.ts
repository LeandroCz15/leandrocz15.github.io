import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { TabData } from '../../interfaces/tab-structure';
import { GridComponent } from '../grid/grid.component';
import { Subject } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ServerResponse, indexArrayByProperty } from 'src/application-utils';
import { CONTEXT_MENU, HQL_PROPERTY, HttpMethod, TABS_MODAL } from 'src/application-constants';
import { CazzeonService } from 'src/app/cazzeon-service/cazzeon-service';
import { ContextMenuItem } from '../context-menu/context-menu.component';
import { PaginationEventType } from '../pagination/pagination.component';
import { ProcessExecutorService } from 'src/app/process/process-executor.service';

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.css']
})
export class TabComponent implements OnInit {

  /********************** COMPONENT ATTRIBUTES **********************/
  public tabReady: boolean = false; // Boolean used to render the child components once the main fetch is done
  public tabData: TabData = {  // Details of the main tab
    contextMenuItems: [],
    formFields: [],
    gridFields: [],
    allFields: [],
    clickedRow: undefined,
    tab: undefined
  };

  /********************** SUBJECTS **********************/
  public reloadViewSubject: Subject<void> = new Subject();
  public doFetchSubject: Subject<PaginationEventType> = new Subject();

  /********************** CHILD COMPONENTS **********************/
  @ViewChild(GridComponent) gridComponent!: GridComponent;

  constructor(
    private cazzeonService: CazzeonService,
    private processExecutorService: ProcessExecutorService,
    @Inject(MAT_DIALOG_DATA) public data: TabData,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.fetchTabData();
  }

  fetchTabData(): void {
    this.cazzeonService.request(`api/data/tab?tabId=${this.data.tab.id}`, HttpMethod.GET, async (response: Response) => {
      const jsonResponse: ServerResponse = await response.json();
      const gridComponent = this.gridComponent;
      const deleteFunction = this.cazzeonService.deleteRows.bind(this.cazzeonService);
      this.tabData.contextMenuItems = [
        {
          label: CONTEXT_MENU.actionsLabel, imageSource: CONTEXT_MENU.actionsIcon, items: this.constructProcessItems(jsonResponse.body.buttonAndProcess)
        },
        {
          label: CONTEXT_MENU.tabsLabel, imageSource: CONTEXT_MENU.tabsIcon, items: this.constructTabItems(jsonResponse.body.tabs)
        },
        {
          label: CONTEXT_MENU.deleteLabel, imageSource: CONTEXT_MENU.deleteIcon, clickFn(row, item) {
            deleteFunction(gridComponent, [row]);
          }
        }
      ];
    }, async (response: Response) => {
      const jsonResponse: ServerResponse = await response.json();
      console.error(`Error when fetching data for tab with: ${jsonResponse.message}`);
    }, (error: TypeError) => {
      console.error(`Error while initializing the tab: ${error.message}`);
    });
    this.tabData.tab = this.data.tab;
    this.tabData.clickedRow = this.data.clickedRow;
    this.constructFieldsAndHeaders(this.data.tab.fields);
    this.tabReady = true;
  }

  /**
    * Construct the items in the context menu that will contain
    * all the tabs
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
    * Construct the items in the context menu that will contain
    * all the processes
    * @param items Object to construct the ContextMenuItem array
    * @returns Array of ContextMenuItem representing processes
  */
  constructProcessItems(items: any[]): ContextMenuItem[] {
    const executeProcessFunction = this.processExecutorService.callProcess.bind(this.processExecutorService);
    return items.map(obj => {
      return {
        label: obj.name,
        imageSource: obj.iconSource,
        javaClass: obj.javaClass,
        clickFn(row: any, item: ContextMenuItem) {
          executeProcessFunction(row, { javaClass: item.javaClass!, buttonParameters: obj.buttonParameters });
        },
      }
    });
  }

  /**
    * Open the selected tab
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
    * 
    * @param fields Properties of the entity to construct the header and form
  */
  constructFieldsAndHeaders(fields: any[]): void {
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
      this.tabData.allFields.push(field);
    });
    this.tabData.gridFields = newGridFields;
    this.tabData.formFields = newFormFields;
  }

  /**
    * Function to handle the logic when dragging and dropping a header of the current view
    * 
    * @param event Drag and drop event
  */
  dropFilterColumn(event: CdkDragDrop<any[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.tabData.gridFields, event.previousIndex, event.currentIndex);
      this.gridComponent.currentGridFieldsIndexedByHqlProperty = indexArrayByProperty(this.tabData.gridFields, HQL_PROPERTY);
      this.reloadViewSubject.next();
    }
  }

}