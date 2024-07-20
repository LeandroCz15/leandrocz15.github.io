import { Injectable } from "@angular/core";
import { HttpMethod, LoginStatus } from "src/application-constants";
import { ViewComponent } from "../basic-view/components/view/view.component";
import { Observable, Subject } from "rxjs";
import { GridComponent } from "../basic-view/components/grid/grid.component";
import { getServerUrl } from "src/application-utils";
import { MatSnackBar } from "@angular/material/snack-bar";

const JWT_TOKEN = "jwtToken";

@Injectable({
  providedIn: "root",
})
export class CazzeonService {

  private loginSubject: Subject<LoginStatus> = new Subject();

  constructor(private snackBar: MatSnackBar) { }

  login(): void {
    this.loginSubject.next(LoginStatus.LOGIN);
  }

  logout(): void {
    this.loginSubject.next(LoginStatus.LOGOUT);
    this.clearTokens();
  }

  getLoginSubjectAsObservable(): Observable<LoginStatus> {
    return this.loginSubject.asObservable();
  }

  getJwtToken(): string {
    return sessionStorage.getItem(JWT_TOKEN) || "";
  }

  setJwtToken(value: string): void {
    sessionStorage.setItem(JWT_TOKEN, value);
  }

  clearTokens(): void {
    sessionStorage.removeItem(JWT_TOKEN);
  }

  /**
   * Do a request to the server
   * @param urlSufix Path of the endpoint to fetch against. This parameter will be concatenated after DOMAIN
   * @param method HTTP Method of the request
   * @param successResponseFunction Function to execute if the response is successfull
   * @param errorResponseFunction Function to execute if the response is not successfull
   * @param errorFunction Function to execute if the request could not be done because of an unexpected error.
   * @param requestBody Body to send in the request
   */
  request(
    urlSufix: string,
    method: HttpMethod,
    successResponseFunction: (response: Response) => void,
    errorResponseFunction: (response: Response) => void,
    errorFunction: (error: Error) => void,
    requestBody?: any,
  ): void {
    fetch(`${getServerUrl()}${urlSufix}`, {
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
    }).catch(error => {
      errorFunction(error);
    });
  }

}