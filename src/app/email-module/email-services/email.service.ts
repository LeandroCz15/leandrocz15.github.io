import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private selectedProgrammedEmail: Subject<{
    id: string,
    name: string,
    body: string,
    active: boolean,
    sendHour: number,
    sendMinute: number,
    sendSecond: number,
    sendMonday: boolean,
    sendTuesday: boolean,
    sendWednesday: boolean,
    sendThursday: boolean,
    sendFriday: boolean,
    sendSaturday: boolean,
    sendSunday: boolean,
    appUser: string,
    addresses: Array<string>,
  }> = new Subject<{
    id: string,
    name: string,
    body: string,
    active: boolean,
    sendHour: number,
    sendMinute: number,
    sendSecond: number,
    sendMonday: boolean,
    sendTuesday: boolean,
    sendWednesday: boolean,
    sendThursday: boolean,
    sendFriday: boolean,
    sendSaturday: boolean,
    sendSunday: boolean,
    appUser: string,
    addresses: Array<string>,
  }>;

  private updateProgrammedEmail: Subject<{
    id: string,
    name: string,
    body: string,
    active: boolean,
    sendHour: number,
    sendMinute: number,
    sendSecond: number,
    sendMonday: boolean,
    sendTuesday: boolean,
    sendWednesday: boolean,
    sendThursday: boolean,
    sendFriday: boolean,
    sendSaturday: boolean,
    sendSunday: boolean
  }> = new Subject<{
    id: string,
    name: string,
    body: string,
    active: boolean,
    sendHour: number,
    sendMinute: number,
    sendSecond: number,
    sendMonday: boolean,
    sendTuesday: boolean,
    sendWednesday: boolean,
    sendThursday: boolean,
    sendFriday: boolean,
    sendSaturday: boolean,
    sendSunday: boolean
  }>;

  constructor() { }

  setSelectedEmail(info: any) {
    this.selectedProgrammedEmail.next(info);
  }

  getSelectedEmailObservable() {
    return this.selectedProgrammedEmail.asObservable();
  }

  setUpdateProgrammedEmail(info: any) {
    return this.updateProgrammedEmail.next(info);
  }

  getUpdateProgrammedEmailObservable() {
    return this.updateProgrammedEmail.asObservable();
  }

}