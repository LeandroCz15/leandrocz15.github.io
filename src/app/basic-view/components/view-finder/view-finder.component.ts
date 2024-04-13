import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { SelectPageService } from '../../services/select-page.service';
import { CazzeonService } from 'src/app/cazzeon-service/cazzeon-service';
import { HttpMethod, VIEW_FINDER } from 'src/application-constants';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-view-finder',
  templateUrl: './view-finder.component.html',
  styleUrls: ['./view-finder.component.css']
})
export class ViewFinderComponent implements OnInit, OnDestroy {

  /********************** COMPONENT ATTRIBUTES **********************/
  public formControl = new FormControl('');
  public isDisplayed: boolean = false;
  public viewOptions: any[] = [];

  @ViewChild("searchInput") searchInput!: ElementRef;
  @ViewChild("viewFinder") viewFinder!: ElementRef;

  /********************** SUBSCRIPTIONS  **********************/
  private valueChangeSubscription!: Subscription;

  constructor(
    private cdr: ChangeDetectorRef,
    private pageChangeService: SelectPageService,
    private cazzeonService: CazzeonService
  ) {}

  ngOnInit(): void {
    this.valueChangeSubscription = this.formControl.valueChanges.pipe(debounceTime(VIEW_FINDER.defaultDebounceTime), distinctUntilChanged()).subscribe(event => {
      if (!this.isDisplayed) {
        return;
      }
      this.cazzeonService.request(`api/data/viewfinder?value=${event}`, HttpMethod.GET, async (response: Response) => {
        this.viewOptions = await response.json();
      }, async (response: Response) => {
        console.error(`Error while fetching data on the view finder: ${await response.text()}`);
      }, (error: TypeError) => {
        console.error(`Unexpected error on the view finder: ${error.message}`);
      });
    });
  }

  ngOnDestroy(): void {
    this.valueChangeSubscription.unsubscribe();
  }

  /**
   * Function to display the name of the view in the input
   * 
   * @param viewObj View object
   * @returns Name of the view
   */
  displayFunction(viewObj: any) {
    return viewObj?.name;
  }

  /**
   * Close the context menu and opens the selected view
   * 
   * @param event Autocomplete event
   */
  closeFinderAndOpenWindow(event: MatAutocompleteSelectedEvent): void {
    this.pageChangeService.sendPageChange(event.option.value.id);
    this.closeAndClean();
  }

  /**
   * Close the context menu on escape
   * 
   * @param event Escape event
   */
  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: Event) {
    if (!this.isDisplayed) {
      return;
    }
    this.closeAndClean();
  }

  /**
   * Close the context menu on any click
   * 
   * @param event Click event
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    // If not displayed or clicking inside of it, avoid close call
    if (!this.isDisplayed || this.viewFinder.nativeElement.contains(event.target)) {
      return;
    }
    this.closeAndClean();
  }

  /**
   * Open the context menu on CTRL + ENTER and focus the input
   * 
   * @param event Keyboard event
   */
  @HostListener('document:keydown.control.enter', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.isDisplayed) {
      // If it's displayed just restore focus
      this.searchInput.nativeElement.focus();
      return;
    }
    this.isDisplayed = true;
    this.cdr.detectChanges();
    const mainViewElement: HTMLElement = this.viewFinder.nativeElement.parentElement.parentElement;
    const newWidthPx: number = (mainViewElement.clientWidth * VIEW_FINDER.defaultWidthPcntg) / 100;
    const newLeftPx: number = (mainViewElement.clientWidth / 2) + mainViewElement.offsetLeft - (newWidthPx / 2);
    this.viewFinder.nativeElement.style.width = `${newWidthPx}px`;
    this.viewFinder.nativeElement.style.left = `${newLeftPx}px`;
    this.searchInput.nativeElement.focus();
  }

  /**
   * Close the context menu and clean all of it's options
   */
  closeAndClean(): void {
    this.isDisplayed = false;
    this.formControl.reset();
    this.viewOptions.splice(0);
  }

}