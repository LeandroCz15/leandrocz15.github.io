import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription, filter } from 'rxjs';
import { HeaderComponent } from '../header/header.component';
import { RowsComponent } from '../rows/rows.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { AuthService } from 'src/app/login-module/auth-service';
import { SelectPageService } from '../services/select-page.service';
import { HttpMethod } from 'src/application-constants';
import { indexArrayByProperty } from 'src/application-utils';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit, OnDestroy {

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

  // Current fields to show in the main tab
  public gridFields: any[] = [];

  // Indexed fields for better performance
  public currentTabFieldsIndexedByHqlProperty: any = {};

  // Subscription for page change service
  private pageChangeSubscription!: Subscription;

  // Service to reload the view
  public reloadViewSubject: Subject<void> = new Subject<void>;

  constructor(private authService: AuthService, private pageChangeService: SelectPageService) { }

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
      this.currentTabFieldsIndexedByHqlProperty = indexArrayByProperty(this.gridFields, "hqlProperty");
      this.viewReady = true;
    }, (response: Response) => {
      console.log(`Error while fetching data of the view with id: ${this.viewId}. Error status: ${response.status}`);
    }, (error: any) => {
      console.error("Error while fetching main tab information");
    });
  }

  /**
   * This function sets all the fields needed to be render by the current view. Adding some properties to the objects
   * 
   * @param data Data containing the fields to be rendered
   */
  processMainTabInformation(mainTabData: any) {
    this.mainTabId = mainTabData.id;
    this.mainTabEntityName = mainTabData.entityName;
    const newGridTabFields: any[] = [];
    mainTabData.fields.forEach((field: any) => {
      field.lastValueUsedForSearch = undefined;
      field.value = undefined;
      newGridTabFields.push(field);
    });
    this.gridFields = newGridTabFields;
  }

}
