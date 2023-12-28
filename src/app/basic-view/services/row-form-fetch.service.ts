/** 
 * @description
 * This service is meant to be used after a fetch to the backend to retrieve a single row was successfull.
 * Since after a fetch the current row being inserted/updated can change. It is needed to not only modify the row
 * in the form. It is also needed to modify the row being shown in the grid.
 */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class RowFormFetchService {

  private rowFetch: Subject<any> = new Subject<any>;

  constructor() { }

  getRowFetchObservable() {
    return this.rowFetch.asObservable();
  }

  sendRowFetchChange(row: any) {
    this.rowFetch.next(row);
  }

}
