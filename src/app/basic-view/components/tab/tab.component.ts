import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TabData } from '../../interfaces/tab-structure';
import { GridComponent } from '../grid/grid.component';
import { Subject } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { indexArrayByProperty } from 'src/application-utils';
import { HQL_PROPERTY, HttpMethod } from 'src/application-constants';
import { CazzeonService } from 'src/app/cazzeon-service/cazzeon-service';
import { ContextMenuItem } from '../context-menu/context-menu.component';
import { PaginationEventType } from '../pagination/pagination.component';

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
    private dialogRef: MatDialogRef<TabComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TabData,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.cazzeonService.request(`api/data/tab?tabId=${this.data.tab.id}`, HttpMethod.GET, async (response: Response) => {
      const jsonResponse = await response.json();
      const deleteFunction = this.cazzeonService.deleteRows.bind(this.cazzeonService);
      const gridComponent = this.gridComponent;
      this.tabData.contextMenuItems = [
        {
          label: "Actions", imageSource: "bi-cpu", items: this.constructProcessItems(jsonResponse.buttonAndProcess)
        },
        {
          label: "Tabs", imageSource: "bi-journals", items: this.constructTabItems(jsonResponse.tabs)
        },
        {
          label: "Delete", imageSource: "bi-trash", clickFn(row, item) {
            deleteFunction(gridComponent, [row]);
          }
        }
      ];
    }, async (response: Response) => {
      console.error(`Error when fetching data for the tab with id: ${this.data.tab.id}. Error: ${await response.text()}`);
    }, (error: Error) => {
      console.error(`Timeout when fetching data for the tab with id: ${this.data.tab.id}`);
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