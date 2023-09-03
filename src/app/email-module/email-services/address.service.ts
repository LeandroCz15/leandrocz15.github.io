import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  private addressList: Subject<Array<string>> = new Subject<Array<string>>;

  constructor() { }

  setAddressList(info: any) {
    this.addressList.next(info);
  }

  getAddressListObservable() {
    return this.addressList.asObservable();
  }

}