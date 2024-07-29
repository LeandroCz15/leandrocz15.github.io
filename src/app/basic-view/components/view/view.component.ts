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
import { PaginationComponent, PaginationEventType } from '../pagination/pagination.component';
import { CazzeonFormBuilderService, DataType } from 'src/app/form-components/cazzeon-form-builder/cazzeon-form-builder.service';
import { FormGroup } from '@angular/forms';
import { CazzeonFormComponent } from 'src/app/form-components/cazzeon-form-component/cazzeon-form-component';
import { FileUploaderFormComponent } from 'src/app/form-components/file-uploader/file-uploader.component';
import { SelectorFormComponent } from 'src/app/form-components/selector/selector.component';
import { DatePickerFormComponent } from 'src/app/form-components/date-picker/date-picker.component';
import { DecimalFormComponent } from 'src/app/form-components/decimal/decimal.component';
import { IntegerFormComponent } from 'src/app/form-components/integer/integer.component';
import { NaturalFormComponent } from 'src/app/form-components/natural/natural.component';
import { TextFormComponent } from 'src/app/form-components/text/text.component';
import { LargeTextFormComponent } from 'src/app/form-components/large-text/large-text.component';
import { CheckBoxFormComponent } from 'src/app/form-components/checkbox/checkbox.component';
import { PasswordFormComponent } from 'src/app/form-components/password/password.component';
import { HeaderComponent } from '../header/header.component';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit, OnDestroy {

  /********************** COMPONENT ATTRIBUTES **********************/
  public viewData: any;
  public viewReady: boolean = false;
  public mainTabData: TabData = {
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
  @ViewChild(HeaderComponent) header!: HeaderComponent;
  @ViewChild(GridComponent) grid!: GridComponent;
  @ViewChild(PaginationComponent) pagination!: PaginationComponent;

  constructor(
    private cazzeonService: CazzeonService,
    private snackbar: SnackbarService,
    private pageChangeService: SelectPageService,
    private dialog: MatDialog,
    private cazzeonFormBuilderService: CazzeonFormBuilderService
  ) { }

  ngOnInit(): void {
    this.pageChangeSubscription = this.pageChangeService.getPageChangeObservable().subscribe(async viewId => {
      this.viewReady = false;
      this.cazzeonService.request(`api/view?viewId=${viewId}`, HttpMethod.GET, async (response: Response) => {
        const jsonResponse: ServerResponse = await response.json();
        this.viewData = jsonResponse.body;
        this.mainTabData.tab = jsonResponse.body.mainTab;
        this.constructMenuItems(jsonResponse.body);
        this.constructFields(jsonResponse.body.mainTab.fields);
        this.viewReady = true;
      }, async (response: Response) => {
        const jsonResponse: ServerResponse = await response.json();
        this.snackbar.showError(jsonResponse.message);
        console.error(`Server response error: ${jsonResponse.message}`);
      }, (error: Error) => {
        this.snackbar.showError(error.message);
        console.error(`Unexpected error: ${error.message}`);
      });
    });
  }

  ngOnDestroy(): void {
    this.pageChangeSubscription.unsubscribe();
  }

  /**
   * This function will construct the grid and form fields of the current view.
   * 
   * @param fields Properties of the entity to construct the header and form.
   */
  constructFields(fields: any[]): void {
    const newGridFields: any[] = [];
    const newFormFields: any[] = [];
    const newFields: any[] = [];
    fields.forEach(field => {
      field.lastValueUsedForSearch = undefined;
      field.value = undefined;
      if (field.showInGrid) {
        newGridFields.push(field);
      }
      if (field.showInForm) {
        newFormFields.push(field);
      }
      newFields.push(field);
    });
    this.mainTabData.gridFields = newGridFields;
    this.mainTabData.formFields = newFormFields;
    this.mainTabData.allFields = newFields;
  }

  /**
   * Construct the items of the context menu. This is made in the view component because the buttons and process are view related.
   * 
   * @param items Items from response. This items needs to be converted into ContextMenuItem interface.
   */
  constructMenuItems(viewData: any): void {
    const view = this;
    this.mainTabData.contextMenuItems = [
      {
        label: CONTEXT_MENU.actionsLabel, imageSource: CONTEXT_MENU.actionsIcon, items: this.constructProcessItems(viewData.buttonAndProcess)
      },
      {
        label: CONTEXT_MENU.tabsLabel, imageSource: CONTEXT_MENU.tabsIcon, items: this.constructTabItems(viewData.tabs)
      },
      {
        label: CONTEXT_MENU.deleteLabel, imageSource: CONTEXT_MENU.deleteIcon, clickFn(clickedRow, item) {
          view.cazzeonService.request(`api/entity/delete/${view.viewData.mainTab.entityName}`, HttpMethod.DELETE,
            (response: Response) => {
              view.grid.rows = view.grid.rows.filter(row => row !== clickedRow);
            },
            async (response: Response) => {
              const jsonResponse = await response.json() as ServerResponse;
              console.error(`Error while deleting: ${jsonResponse.message}`);
            },
            (error: Error) => {
              console.error(`Unexpected error while deleting: ${error.message}`);
            },
            JSON.stringify({ delete: [clickedRow] }));
        }
      }
    ];
  }

  /**
   * Construct process items for the context menu.
   * 
   * @param processButtons Process buttons to convert into context menu items.
   * @returns Context menu item array representing the process buttons of the current view.
   */
  constructProcessItems(processButtons: any[]): ContextMenuItem[] {
    const openProcessFunction = this.openProcess.bind(this);
    return processButtons.map(processButton => {
      return {
        label: processButton.name,
        imageSource: processButton.iconSource,
        extraData: processButton,
        clickFn(row: any, item: ContextMenuItem) {
          openProcessFunction(row, item);
        },
      }
    });
  }

  /**
   * Construct tab items for the context menu.
   * 
   * @param tabs Tabs to convert into context menu items.
   * @returns Context menu item array representing the tabs of the current view.
   */
  constructTabItems(tabs: any[]): ContextMenuItem[] {
    const openTabFunction = this.openTab.bind(this);
    return tabs.map(tab => {
      return {
        label: tab.name,
        imageSource: tab.iconSource,
        extraData: tab,
        clickFn(row: any, item: ContextMenuItem) {
          openTabFunction(row, item);
        },
      }
    });
  }

  /**
   * Open a cazzeon form to execute.
   * 
   * @param row Row from which the click was fired.
   * @param item Selected item representing a process button.
   */
  openProcess(row: any, item: ContextMenuItem): void {
    const openedForm = this.cazzeonFormBuilderService.openCazzeonForm(
      {
        elements: this.buildElements(item.extraData.buttonParameters),
        okLabel: 'Execute',
        cancelLabel: 'Cancel',
        executionFn: (event: Event, form: FormGroup) => {
          if (!form.valid) {
            return;
          }
          this.cazzeonService.request(`api/execute/${item.extraData.javaClass}`, HttpMethod.POST,
            async (response: Response) => {
              const jsonResponse = await response.json() as ServerResponse;
              this.snackbar.showSuccess(jsonResponse.message);
            }, async (response: Response) => {
              const jsonResponse = await response.json() as ServerResponse;
              this.snackbar.showError(jsonResponse.message, jsonResponse.exceptionStackTrace);
              console.error(jsonResponse.message);
            }, (error: Error) => {
              this.snackbar.showError(error.message);
              console.error(error.message);
            }, JSON.stringify({ rows: row, processParameters: form.getRawValue() }));
          openedForm.close(); // implementar cerrado segun check.
        },
        closeFn: () => { }
      });
  }

  /**
   * Open the selected tab.
   * 
   * @param row Row from which the click was fired.
   * @param item Selected item representing a tab.
   */
  openTab(row: any, item: ContextMenuItem): void {
    this.dialog.open(TabComponent, {
      data: { clickedRow: row, tab: item.extraData, parent: this },
      height: TABS_MODAL.defaultHeight,
      width: TABS_MODAL.defaultWidth
    });
  }

  /**
   * Function to handle the logic when dragging and dropping a header of the current view.
   * 
   * @param event Drag and drop event.
   */
  dropFilterColumn(event: CdkDragDrop<any[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.mainTabData.gridFields, event.previousIndex, event.currentIndex);
      this.grid.currentGridFieldsIndexedByHqlProperty = indexArrayByProperty(this.mainTabData.gridFields, HQL_PROPERTY);
      this.reloadViewSubject.next();
    }
  }

  /**
   * This function will take button parameters as input and create an array of cazzeon form components
   * to use when opening a cazzeon form.
   * 
   * @param buttonParameters Button parameters retrieved from the database to build the button parameters of a process.
   * @returns An array of cazzeon form components to use in a cazzeon form builder.
   */
  buildElements(buttonParameters: any): CazzeonFormComponent[] {
    const components: CazzeonFormComponent[] = [];
    buttonParameters.forEach((btnParamter: any) => {
      switch (btnParamter.type) {
        case DataType.FILE:
          components.push(new FileUploaderFormComponent(btnParamter.name, btnParamter.formName, btnParamter.required, { fileExtension: btnParamter.fileExtension, maxFileSize: btnParamter.fileSize }));
          break;
        case DataType.SELECTOR:
          components.push(new SelectorFormComponent(btnParamter.name, btnParamter.formName, btnParamter.required,
            {
              entityToSearch: btnParamter.searchClass,
              identifiers: btnParamter.identifiers,
              propertyForMatch: btnParamter.propertyForMatch,
              predicateExtensorName: btnParamter.predicateExtensionName
            }
          ));
          break;
        case DataType.DATE:
          components.push(new DatePickerFormComponent(btnParamter.name, btnParamter.formName, btnParamter.required, btnParamter.defaultValue));
          break;
        case DataType.DECIMAL:
          components.push(new DecimalFormComponent(btnParamter.name, btnParamter.formName, btnParamter.required, btnParamter.defaultValue, btnParamter.minimum, btnParamter.maximum));
          break;
        case DataType.INTEGER:
          components.push(new IntegerFormComponent(btnParamter.name, btnParamter.formName, btnParamter.required, btnParamter.defaultValue, btnParamter.minimum, btnParamter.maximum));
          break;
        case DataType.NATURAL:
          components.push(new NaturalFormComponent(btnParamter.name, btnParamter.formName, btnParamter.required, btnParamter.defaultValue, btnParamter.minimum, btnParamter.maximum));
          break;
        case DataType.TEXT:
          components.push(new TextFormComponent(btnParamter.name, btnParamter.formName, btnParamter.required, btnParamter.defaultValue));
          break;
        case DataType.LARGE_TEXT:
          components.push(new LargeTextFormComponent(btnParamter.name, btnParamter.formName, btnParamter.required, btnParamter.rows, btnParamter.defaultValue));
          break;
        case DataType.CHECKBOX:
          components.push(new CheckBoxFormComponent(btnParamter.name, btnParamter.formName, btnParamter.defaultValue));
          break;
        case DataType.PASSWORD:
          components.push(new PasswordFormComponent(btnParamter.name, btnParamter.formName, btnParamter.required, btnParamter.defaultValue));
          break;
        default:
          console.error(`Unknown type of button parameter: ${btnParamter.type}`);
      }
    });
    return components;
  }

}

export interface TabData {
  clickedRow: any
  tab: any
  gridFields: any[]
  formFields: any[]
  allFields: any[]
  contextMenuItems: ContextMenuItem[]
}
