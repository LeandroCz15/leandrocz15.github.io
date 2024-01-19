import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';

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
export class ContextMenuComponent implements AfterViewInit {

  public readonly DEFAULT_MENU_WIDTH = 100;
  public readonly DEFAULT_MENU_HEIGHT = 150;

  public data!: ContextMenuData;

  public componentRef!: any;

  @ViewChild("contextMenuElement") contextMenuElement!: ElementRef;

  constructor() { }

  ngAfterViewInit(): void {
    const adjustedX = Math.min(this.data.left + this.data.leftOffset, window.innerWidth - this.DEFAULT_MENU_WIDTH);
    const adjustedY = Math.min(this.data.top + this.data.topOffset, window.innerHeight - this.DEFAULT_MENU_HEIGHT);
    this.contextMenuElement.nativeElement.style.top = `${adjustedY}px`;
    this.contextMenuElement.nativeElement.style.left = `${adjustedX}px`;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    this.componentRef.destroy();
  }

  // Function to keep track of rows using the index given by the *ngFor
  trackByFn(index: number, item: any): number {
    return index;
  }

}
