import { Injectable } from "@angular/core";
import { Subject, Observable } from "rxjs";
import { HttpMethod, SERVER_URL } from "src/application-constants";
import { ViewComponent } from "../basic-view/view/view.component";

@Injectable({
  providedIn: "root",
})
export class AuthService {

  private authServiceSubject = new Subject<AuthService>();

  getUser(): any {
    return sessionStorage.getItem("user") || "";
  }

  setUser(value: any): void {
    sessionStorage.setItem("user", JSON.stringify(value));
    this.authServiceSubject.next(this);
  }

  getToken(): string {
    return sessionStorage.getItem("token") || "";
  }

  setToken(value: string): void {
    sessionStorage.setItem("token", JSON.stringify(value));
    this.authServiceSubject.next(this);
  }

  clear(): void {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    this.authServiceSubject.next(this);
  }

  getCredentialsObservable(): Observable<AuthService> {
    return this.authServiceSubject.asObservable();
  }

  fetchInformation(
    urlSufix: string,
    method: string,
    successResponseFunction: (response: Response) => void,
    errorResponseFunction: (response: Response) => void,
    timeOutFunction: (error: any) => void,
    requestBody?: any,
    email?: string,
    password?: string
  ): void {
    if (method === HttpMethod.GET && requestBody) {
      throw new Error("The request should not have body if it's a GET type");
    }
    let storagedUserJson: any = this.getUser() ? JSON.parse(this.getUser()) : undefined;
    fetch(`${SERVER_URL}${urlSufix}`, {
      method: method,
      headers: {
        "Authorization": "Basic " + btoa(`${email || storagedUserJson?.email}:${password || storagedUserJson?.password}`),
        "Accept": "application/json",
        "Origin": origin,
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
    this.fetchInformation(`api/delete/${view.mainTabEntityName}`, HttpMethod.DELETE,
      (response: Response) => {
        view.gridComponent.rows = view.gridComponent.rows.filter(row => !rowsToDelete.includes(row));
      },
      async (response: Response) => {
        console.error(`Server error while trying to delete rows of the entity: ${view.mainTabEntityName}. Error ${await response.text()}`);
      },
      (error: any) => {
        console.error(`Timeout while deleting rows of of the entity: ${view.mainTabEntityName}`);
      },
      JSON.stringify({ data: dataArrayToDelete }));
  }

  /**
   * Send a request to the backend to execute a cazzeon process
   * 
   * @param row Row to execute the process
   * @param item Item clicked
   */
  executeProcess(row: any, item: any): void {
    console.log("ASD")
  }

}