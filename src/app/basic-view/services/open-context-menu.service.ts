import { Injectable } from '@angular/core';
import { ContextMenuData } from '../context-menu/context-menu.component';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpenContextMenuService {

  private openContextMenuSubject: Subject<ContextMenuData> = new Subject<ContextMenuData>;

  constructor() { }

  getContextMenuSubject() {
    return this.openContextMenuSubject.asObservable();
  }

  openContextMenu(data: ContextMenuData) {
    this.openContextMenuSubject.next(data);
  }

}
