import { Injectable } from "@angular/core";
import { HttpMethod, LoginStatus, SERVER_URL } from "src/application-constants";
import { ViewComponent } from "../basic-view/components/view/view.component";
import { ContextMenuItem } from "../basic-view/components/context-menu/context-menu.component";
import { Observable, Subject } from "rxjs";

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
   * @param view View from which the entity is being deleted
   * @param rowsToDelete Rows to delete
   */
  deleteRows(view: ViewComponent, rowsToDelete: any[]): void {
    const dataArrayToDelete = rowsToDelete.map(function (obj) {
      return obj.id;
    });
    this.request(`api/delete/${view.mainTabData.tabEntityName}`, HttpMethod.DELETE,
      (response: Response) => {
        view.gridComponent.rows = view.gridComponent.rows.filter(row => !rowsToDelete.includes(row));
      },
      async (response: Response) => {
        console.error(`Server error while trying to delete rows of the entity: ${view.mainTabData.tabEntityName}. Error: ${await response.text()}`);
      },
      (error: any) => {
        console.error(`Timeout while deleting rows of of the entity: ${view.mainTabData.tabEntityName}`);
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

  private askForCsrfToken() {
    this.request(`api/auth/csrf`, HttpMethod.GET, async (response: Response) => {
      this.setCsrfToken((await response.json()).token);
    }, async (response: Response) => {
      throw new Error(`Error while fetching CSRF TOKEN. Error: ${await response.text()}`);
    }, (error: any) => {
      throw new Error(`Timeout while fetching CSRF TOKEN`);
    });
  }

}