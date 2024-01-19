import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { OpenContextMenuService } from '../services/open-context-menu.service';
import { Subscription } from 'rxjs';

export interface ContextMenuItem {
  label: string,
  imageSource: string,
  clickFn?: (row: any, item: any) => void,
  hoverFn?: (row: any, item: any/*, itemTopPosition: number, itemLeftPosition: number*/) => void,
  items?: ContextMenuItem[]
}

export interface ContextMenuData {
  top: number,
  left: number,
  topOffset: number,
  leftOffset: number,
  rowClicked: any,
  items: ContextMenuItem[]
}


@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.css']
})
export class ContextMenuComponent implements OnInit, OnDestroy {

  public readonly DEFAULT_MENU_WIDTH = 100;
  public readonly DEFAULT_MENU_HEIGHT = 150;

  // Boolean to render the context menu
  public render: boolean = false;

  // Data of the menu
  public data!: ContextMenuData;

  // Subscription of service to open the context 
  private contextMenuSubscription!: Subscription;

  @ViewChild("menu") contextMenu!: ElementRef;

  constructor(
    private contextMenuService: OpenContextMenuService
  ) { }

  ngOnInit(): void {
    this.contextMenuSubscription = this.contextMenuService.getContextMenuSubject().subscribe(data => this.open(data));
  }

  ngOnDestroy(): void {
    this.contextMenuSubscription.unsubscribe();
  }

  /**
   * Function to display the context menu and update it's items values
   * @param data Data for the context menu
   */
  open(data: ContextMenuData): void {
    this.data = data;
    const adjustedX = Math.min(data.left + data.leftOffset, window.innerWidth - this.DEFAULT_MENU_WIDTH);
    const adjustedY = Math.min(data.top + data.topOffset, window.innerHeight - this.DEFAULT_MENU_HEIGHT);
    this.contextMenu.nativeElement.style.top = `${adjustedY}px`;
    this.contextMenu.nativeElement.style.left = `${adjustedX}px`;
    this.render = true;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    this.render = false;
  }

  // Return an object with styles for the row
  getClasses(): any {
    return this.render ? "position-absolute" : "position-fixed invisible";
  }

  // Function to keep track of rows using the index given by the *ngFor
  trackByFn(index: number, item: any): number {
    return index;
  }

}
