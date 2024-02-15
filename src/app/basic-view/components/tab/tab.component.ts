import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TabData } from '../../interfaces/tab-structure';
import { HeaderComponent } from '../header/header.component';
import { GridComponent } from '../grid/grid.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { Subject } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { indexArrayByProperty } from 'src/application-utils';
import { HQL_PROPERTY } from 'src/application-constants';
import { CazzeonService } from 'src/app/cazzeon-service/cazzeon-service';

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
    tab: {}
  };

  /********************** SUBJECTS **********************/
  public reloadViewSubject: Subject<void> = new Subject();
  public doFetchSubject: Subject<number | undefined> = new Subject();

  /********************** CHILD COMPONENTS **********************/
  @ViewChild(GridComponent) gridComponent!: GridComponent;

  constructor(
    private cazzeonService: CazzeonService,
    private dialogRef: MatDialogRef<TabComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    //this.cazzeonService.request(`api/data/tab?${this.data.} `)
  }

  ngOnInit(): void {
      this.tabData.tab = this.data.tab;
      this.constructFieldsAndHeaders(this.data.tab.fields);
      this.tabReady = true;
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