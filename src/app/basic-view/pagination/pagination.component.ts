import { Component, Input } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {

  // Service to fetch data when the user interacts with the pagination component. HEREDATED FROM PARENT
  @Input() paginationChangeSubject!: Subject<any>;

  private previousFetchLastId: string = "";
  private currentFetchFirstId: string = "";
  public currentFetchSize: number = 50;

  getPreviousFetchLastId(): string {
    return this.previousFetchLastId;
  }

  setPreviousFetchLastId(previousFetchLastId: string): void {
    this.previousFetchLastId = previousFetchLastId;
  }

  getCurrentFetchFirstId(): string {
    return this.currentFetchFirstId;
  }

  setCurrentFetchFirstId(currentFetchFirstId: string) {
    this.currentFetchFirstId = currentFetchFirstId
  }

  fetchNextPage(): void {
    this.paginationChangeSubject.next({ action: PaginationEventType.FETCH_NEXT });
  }

  fetchPreviousPage(): void {
    this.paginationChangeSubject.next({ action: PaginationEventType.FETCH_BACK });
  }

  changeFetchSize(event: any) {
    if (this.currentFetchSize != event.srcElement.innerHTML) {
      this.currentFetchSize = event.srcElement.innerHTML;
      this.paginationChangeSubject.next({ action: PaginationEventType.RELOAD });
    }
  }

}

export enum PaginationEventType {
  RELOAD,
  FETCH_NEXT,
  FETCH_BACK
}
