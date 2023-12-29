/** 
 * @description
 * This service is for fetching rows
 */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FetchRowsService {

  private fetchSubject: Subject<number | undefined> = new Subject<number | undefined>;

  constructor() { }

  getFetchObservable() {
    return this.fetchSubject.asObservable();
  }

  sendFetchChange(paginationAction?: number) {
    this.fetchSubject.next(paginationAction);
  }

}
