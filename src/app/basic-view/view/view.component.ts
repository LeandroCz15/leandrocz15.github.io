import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { HeaderComponent } from '../header/header.component';
import { RowsComponent } from '../rows/rows.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { AuthService, HttpMethod } from 'src/app/login-module/auth-service';
import { SelectPageService } from '../select-page.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {

  // View id to fetch information
  public viewId: string = "";

  // Main tab id of the current view
  public mainTabId: string = "";

  // Entity of the main tab to fetch information
  public mainTabEntityName: string = "";

  // Boolean used to render the child components once the main fetch is done
  public viewReady: boolean = false;

  // Header children component
  @ViewChild(HeaderComponent) headerComponent!: HeaderComponent;

  // Rows children component
  @ViewChild(RowsComponent) rowsComponent!: RowsComponent;

  // Pagination children component
  @ViewChild(PaginationComponent) paginationComponent!: PaginationComponent;

  // Current filters to show in the main tab
  public currentTabFilters: Array<any> = [];

  // Service to sync scroll in the childrens
  public scrollSubject: Subject<ElementRef> = new Subject<ElementRef>;

  // Service to reload the view
  public reloadViewSubject: Subject<void> = new Subject<void>;

  // Service to handle input change in the filters
  public handleInputChangeSubject: Subject<any> = new Subject<any>;

  // Service to fetch data when the user interacts with the pagination component
  public paginationChangeSubject: Subject<any> = new Subject<any>;

  // Service to send data to a modal when clicking in a row
  public openRowFormSubject: Subject<any> = new Subject<any>;

  // Object of keys indexed to make sort algorithm faster. ONLY TO PASS TO CHILD
  public sortObject: any;

  constructor(private authService: AuthService, private pageChangeService: SelectPageService) { }

  ngOnInit(): void {
    this.pageChangeService.getPageChangeObservable().subscribe(viewId => {
      this.viewReady = false;
      this.viewId = viewId;
      this.fetchMainTabInformation();
    });
  }

  /**
   * This function fetch the main tab information
   */
  fetchMainTabInformation() {
    this.authService.fetchInformation(`api/data/view?viewId=${this.viewId}`, HttpMethod.GET, async (response: Response) => {
      this.processMainTabInformation(await response.json());
      this.createReloadObject();
      this.viewReady = true;
    }, (response: Response) => {
      console.log(`Error while fetching data of the view with id: ${this.viewId}. Error status: ${response.status}`);
    });
  }

  /**
   * This function sets all the filters needed to be render by the current view. Adding some properties to the objects
   * 
   * @param data Data containing the filters to be rendered
   */
  processMainTabInformation(mainTabData: any) {
    this.mainTabId = mainTabData.id;
    this.mainTabEntityName = mainTabData.entityName;
    let newFilterArray: any[] = [];
    mainTabData.fields.forEach((field: any) => {
      field.lastValueUsedForSearch = undefined;
      field.value = undefined;
      newFilterArray.push(field);
    });
    this.currentTabFilters = [...newFilterArray];
  }

  /**
   * Creates an indexed object to order the keys of the rows fetched in this view
   */
  createReloadObject(): void {
    let obj: any = {};
    for (let i = 0; i < this.currentTabFilters.length; i++) {
      obj[this.currentTabFilters.at(i).hqlProperty] = i;
    }
    this.sortObject = obj;
  }

}