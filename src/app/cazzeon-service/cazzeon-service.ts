import { Injectable } from "@angular/core";
import { HttpMethod, LoginStatus, SERVER_URL } from "src/application-constants";
import { ViewComponent } from "../basic-view/components/view/view.component";
import { ContextMenuItem } from "../basic-view/components/context-menu/context-menu.component";
import { Observable, Subject } from "rxjs";
import { GridComponent } from "../basic-view/components/grid/grid.component";
import { PaginationComponent } from "../basic-view/components/pagination/pagination.component";

const JWT_TOKEN = "jwtToken";
const CSRF_TOKEN = "csrfToken";

@Injectable({
  providedIn: "root",
})
export class CazzeonService {

  public loginSubject: Subject<LoginStatus> = new Subject();

  getLoginSubjectAsObservable(): Observable<LoginStatus> {
    return this.loginSubject.asObservable();
  }

  getJwtToken(): string {
    return sessionStorage.getItem(JWT_TOKEN) || "";
  }

  setJwtToken(value: string): void {
    sessionStorage.setItem(JWT_TOKEN, value);
  }

  getCsrfToken(): string {
    return sessionStorage.getItem(CSRF_TOKEN) || "";
  }

  setCsrfToken(value: string): void {
    sessionStorage.setItem(CSRF_TOKEN, value);
  }

  clearTokens(): void {
    sessionStorage.removeItem(JWT_TOKEN);
    sessionStorage.removeItem(CSRF_TOKEN);
  }

  /**
   * Do a request to the server
   * @param urlSufix Path of the endpoint to fetch against. This parameter will be concatenated after DOMAIN
   * @param method HTTP Method of the request
   * @param successResponseFunction Function to execute if the response is successfull
   * @param errorResponseFunction Function to execute if the response is not successfull
   * @param timeOutFunction Function to execute if the response is not successfull because of a timeout
   * @param requestBody Body to send in the request
   */
  request(
    urlSufix: string,
    method: HttpMethod,
    successResponseFunction: (response: Response) => void,
    errorResponseFunction: (response: Response) => void,
    timeOutFunction: (error: any) => void,
    requestBody?: any,
  ): void {
    fetch(`${SERVER_URL}${urlSufix}`, {
      method: method,
      headers: {
        "Authorization": `Bearer ${btoa(this.getJwtToken())}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: requestBody
    }).then(response => {
      if (!response.ok) {
        errorResponseFunction(response);
      } else {
        successResponseFunction(response);
      }
    }).catch(reason => {
      timeOutFunction(reason);
    });
  }

  /**
   * Send a request to the backend to delete mutiple rows
   * 
   * @param grid Grid from which the entity is being deleted
   * @param rowsToDelete Rows to delete
   */
  deleteRows(grid: GridComponent, rowsToDelete: any[]): void {
    const dataArrayToDelete = rowsToDelete.map(function (obj) {
      return obj.id;
    });
    this.request(`api/entity/delete/${grid.tabData.tab.entityName}`, HttpMethod.DELETE,
      (response: Response) => {
        grid.rows = grid.rows.filter(row => !rowsToDelete.includes(row));
      },
      async (response: Response) => {
        console.error(`Server error while trying to delete rows of the entity: ${grid.tabData.tab.entityName}. Error: ${await response.text()}`);
      },
      (error: any) => {
        console.error(`Timeout while deleting rows of of the entity: ${grid.tabData.tab.entityName}`);
      },
      JSON.stringify({ data: dataArrayToDelete }));
  }

  /**
 * Send a request to the backend to delete mutiple rows. This function is an alternative for those cases
 * where some function is build before the GridComponent is initialized. So use this instead.
 * 
 * @param viewComponent Grid from which the entity is being deleted
 * @param rowsToDelete Rows to delete
 */
  deleteRowsWithPaginationComponent(viewComponent: ViewComponent, rowsToDelete: any[]): void {
    const dataArrayToDelete = rowsToDelete.map(function (obj) {
      return obj.id;
    });
    this.request(`api/entity/delete/${viewComponent.gridComponent.tabData.tab.entityName}`, HttpMethod.DELETE,
      (response: Response) => {
        viewComponent.gridComponent.rows = viewComponent.gridComponent.rows.filter(row => !rowsToDelete.includes(row));
      },
      async (response: Response) => {
        console.error(`Server error while trying to delete rows of the entity: ${viewComponent.gridComponent.tabData.tab.entityName}. Error: ${await response.text()}`);
      },
      (error: any) => {
        console.error(`Timeout while deleting rows of of the entity: ${viewComponent.gridComponent.tabData.tab.entityName}`);
      },
      JSON.stringify({ data: dataArrayToDelete }));
  }

  /**
   * Send a request to the backend to execute a cazzeon process
   * 
   * @param row Row to execute the process
   * @param item Item clicked
   */
  executeProcess(row: any, item: ContextMenuItem): void {
    this.request(`api/execute/${item.javaClass}`, HttpMethod.POST, async (response: Response) => {
    }, async (response: Response) => {
      const errorResponse = await response.json();
      console.error(`Error while calling process: ${item.javaClass}. Error: ${await errorResponse.message}`);
    }, (response: Response) => {
      console.error(`Timeout while calling process: ${item.javaClass}`);
    }, JSON.stringify({ item: item, row: row }));
  }

}