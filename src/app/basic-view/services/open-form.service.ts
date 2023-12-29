/** 
 * @description
 * This service is for opening the form modal to insert/update a row
 */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class OpenFormService {

  private rowFetch: Subject<any> = new Subject<any>;

  constructor() { }

  getRowObservable() {
    return this.rowFetch.asObservable();
  }

  sendRowChange(row: any) {
    this.rowFetch.next(row);
  }

}
