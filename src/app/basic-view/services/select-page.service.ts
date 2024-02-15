import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectPageService {

  private pageChangeSubject: Subject<string> = new Subject<string>;

  constructor() { }

  getPageChangeObservable() {
    return this.pageChangeSubject.asObservable();
  }

  sendPageChange(viewId: string) {
    this.pageChangeSubject.next(viewId);
  }

}
