import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { VIEW_FINDER } from 'src/application-constants';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { SelectPageService } from 'src/app/basic-view/services/select-page.service';
import { SelectorComponent } from "../../form-components/selector/selector.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-finder',
  templateUrl: './view-finder.component.html',
  styleUrls: ['./view-finder.component.css'],
  standalone: true,
  imports: [
    SelectorComponent,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class ViewFinderComponent {

  /********************** COMPONENT ATTRIBUTES **********************/
  public formGroup: FormGroup;
  public formControl: FormControl;
  public isDisplayed: boolean = false;

  /********************** CHILD ELEMENTS **********************/
  @ViewChild(SelectorComponent) selectorComponent!: SelectorComponent;
  @ViewChild("viewFinderForm") viewFinderForm!: ElementRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private pageChangeService: SelectPageService,
    private formBuilder: FormBuilder
  ) {
    const group: any = {};
    this.formControl = new FormControl();
    group.viewFinderSelector = this.formControl;
    this.formGroup = this.formBuilder.group(group);
  }

  /**
   * Close the context menu and opens the selected view.
   * 
   * @param event Autocomplete event.
   */
  closeFinderAndOpenWindow(event: MatAutocompleteSelectedEvent): void {
    this.pageChangeService.sendPageChange(event.option.value.id);
    this.close();
  }

  /**
   * Close the context menu on escape.
   * 
   * @param event Escape event.
   */
  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: Event) {
    if (!this.isDisplayed) {
      return;
    }
    this.close();
  }

  /**
   * Close the context menu on any click.
   * 
   * @param event Click event.
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    // If not displayed or clicking inside of it, avoid close call
    if (!this.isDisplayed || this.viewFinderForm.nativeElement.contains(event.target)) {
      return;
    }
    this.close();
  }

  /**
   * Open the context menu on CTRL + ENTER and focus the input.
   * 
   * @param event Keyboard event.
   */
  @HostListener('document:keydown.control.enter', ['$event'])
  onHandleKeyDown(event: KeyboardEvent) {
    this.open();
    this.selectorComponent.selectorInput.nativeElement.focus();
  }

  /**
   * Resize the view finder to achieve responsive behavior.
   * 
   * @param event Resize event.
   */
  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event) {
    this.open();
  }

  /**
   * Open the view finder.
   */
  open(): void {
    if (this.isDisplayed) {
      return;
    }
    this.isDisplayed = true;
    this.cdr.detectChanges();
    const mainViewElement: HTMLElement = this.viewFinderForm.nativeElement.parentElement.parentElement;
    const newWidthPx: number = (mainViewElement.clientWidth * VIEW_FINDER.defaultWidthPcntg) / 100;
    const newTopPx: number = (mainViewElement.clientHeight / 3) + mainViewElement.offsetTop;
    const newLeftPx: number = (mainViewElement.clientWidth / 2) + mainViewElement.offsetLeft - (newWidthPx / 2);
    this.viewFinderForm.nativeElement.style.width = `${newWidthPx}px`;
    this.viewFinderForm.nativeElement.style.top = `${newTopPx}px`;
    this.viewFinderForm.nativeElement.style.left = `${newLeftPx}px`;
  }

  /**
   * Close the view finder and clean all of it's options.
   */
  close(): void {
    this.isDisplayed = false;
    this.formControl.reset();
  }

}