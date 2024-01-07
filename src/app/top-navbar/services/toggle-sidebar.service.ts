import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToggleSidebarService {

  private toggleSidebarSubject: Subject<boolean> = new Subject<boolean>;

  sendToggle(toggle: boolean): void {
    this.toggleSidebarSubject.next(toggle);
  }

  getObservable(): Observable<boolean> {
    return this.toggleSidebarSubject.asObservable();
  }

}
