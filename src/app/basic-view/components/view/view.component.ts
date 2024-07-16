import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { GridComponent } from '../grid/grid.component';
import { CazzeonService } from 'src/app/cazzeon-service/cazzeon-service';
import { SelectPageService } from '../../services/select-page.service';
import { CONTEXT_MENU, HQL_PROPERTY, HttpMethod, SNACKBAR, TABS_MODAL } from 'src/application-constants';
import { ServerResponse, indexArrayByProperty } from 'src/application-utils';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ContextMenuItem } from '../context-menu/context-menu.component';
import { MatDialog } from '@angular/material/dialog';
import { TabComponent } from '../tab/tab.component';
import { TabData } from '../../interfaces/tab-structure'
import { PaginationEventType } from '../pagination/pagination.component';
import { CazzeonFormBuilderService, DataType } from 'src/app/form-components/cazzeon-form-builder/cazzeon-form-builder.service';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { CazzeonFormComponent } from 'src/app/form-components/cazzeon-form-component';
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
    private snackBar: MatSnackBar,
    private pageChangeService: SelectPageService,
    private dialog: MatDialog,
    private cazzeonFormBuilderService: CazzeonFormBuilderService
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
    const view = this;
    return items.map(obj => {
      return {
        label: obj.name,
        imageSource: obj.iconSource,
        javaClass: obj.javaClass,
        buttonParameters: obj.buttonParameters,
        clickFn(row: any, item: ContextMenuItem) {
          const openedForm = view.cazzeonFormBuilderService.openCazzeonForm(
            {
              elements: view.buildElements(obj),
              okLabel: 'Execute',
              cancelLabel: 'Cancel',
              executionFn: (event: Event, form: FormGroup) => {
                if (!form.valid) {
                  return;
                }
                view.cazzeonService.request(`api/execute/${obj.javaClass}`, HttpMethod.POST, async (response: Response) => {
                  const jsonResponse = await response.json();
                  view.snackBar.openFromComponent(SnackbarComponent, {
                    duration: SNACKBAR.defaultSuccessDuration,
                    data: jsonResponse as ServerResponse
                  });
                }, async (response: Response) => {
                  const jsonResponse = await response.json();
                  view.snackBar.openFromComponent(SnackbarComponent, {
                    duration: SNACKBAR.defaultErrorDuration,
                    data: jsonResponse as ServerResponse
                  });
                }, (error: TypeError) => {
                  console.error(`Unexpected error: ${error.message}`);
                }, JSON.stringify({ rows: row, processParameters: form.getRawValue() }));
                openedForm.close(); // implementar cerrado segun check.
              },
              closeFn: () => { }
            });
        },
      }
    });
  }

  buildElements(button: any): CazzeonFormComponent[] {
    const components: CazzeonFormComponent[] = [];
    button.buttonParameters.forEach((btnParamter: any) => {
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