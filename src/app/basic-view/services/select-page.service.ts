import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CazzeonService } from 'src/app/cazzeon-service/cazzeon-service';

@Injectable({
  providedIn: 'root'
})
export class SelectPageService {

  private pageChangeSubject: Subject<string> = new Subject<string>;

  private lastViewIdSelected: string = "";

  constructor(private cazzeonService: CazzeonService) {
    this.cazzeonService.getLoginSubjectAsObservable().subscribe(event => {
      // Clean last view selected if the user logs in or logs out
      this.lastViewIdSelected = "";
    });
   }

  getPageChangeObservable() {
    return this.pageChangeSubject.asObservable();
  }

  sendPageChange(viewId: string) {
    // Send the view change only if it's changing the current view
    if (this.lastViewIdSelected !== viewId) {
      this.lastViewIdSelected = viewId;
      this.pageChangeSubject.next(viewId);
    }
  }

}