import { Injectable } from "@angular/core";
import { Subject, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class Credentials {

  private email = "";
  private password = "";
  private token = "";
  private usserId = "";

  private credentialsSubject = new Subject<Credentials>();

  getEmail(): string | null {
    return sessionStorage.getItem("email") || this.email;
  }

  setEmail(value: string) {
    this.email = value;
    sessionStorage.setItem("email", value);
    this.credentialsSubject.next(this);
  }

  getPassword(): string | null {
    return sessionStorage.getItem("password") || this.password;
  }

  setPassword(value: string) {
    this.password = value;
    sessionStorage.setItem("password", value);
    this.credentialsSubject.next(this);
  }

  getToken(): string | null {
    return sessionStorage.getItem("token") || this.token;
  }

  setToken(value: string) {
    this.token = value;
    sessionStorage.setItem("token", value);
    this.credentialsSubject.next(this);
  }

  getUsserId(): string | null {
    return sessionStorage.getItem("usserId") || this.usserId;
  }

  setUsserId(value: string) {
    this.usserId = value;
    sessionStorage.setItem("usserId", value);
    this.credentialsSubject.next(this);
  }

  clear() {
    this.email = "";
    this.password = "";
    this.token = ""
    this.usserId = "";
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("password");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usserId");
    this.credentialsSubject.next(this);
  }

  getCredentialsObservable(): Observable<Credentials> {
    return this.credentialsSubject.asObservable();
  }

}
