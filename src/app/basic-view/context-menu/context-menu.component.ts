import { AfterViewInit, Component, ComponentRef, ElementRef, HostListener, ViewChild } from '@angular/core';
import { OpenContextMenuService } from '../services/open-context-menu.service';

export interface ContextMenuItem {
  label: string,
  imageSource: string,
  clickFn?: (row: any, item: any) => void,
  items?: ContextMenuItem[]
}

export interface ContextMenuData {
  top: number,
  left: number,
  rowClicked: any,
  items: ContextMenuItem[]
}

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.css']
})
export class ContextMenuComponent implements AfterViewInit{

  public readonly DEFAULT_MENU_WIDTH = 100;

  public readonly DEFAULT_MENU_HEIGHT = 150;

  public data!: ContextMenuData;

  public contextMenuReference!: ComponentRef<ContextMenuComponent>;

  @ViewChild("contextMenuElement") contextMenuElement!: ElementRef;

  constructor(private contextMenuService: OpenContextMenuService) { }

  ngAfterViewInit(): void {
    const adjustedX = Math.min(this.data.left, window.innerWidth - this.DEFAULT_MENU_WIDTH);
    const adjustedY = Math.min(this.data.top, window.innerHeight - this.DEFAULT_MENU_HEIGHT);
    this.contextMenuElement.nativeElement.style.top = `${adjustedY}px`;
    this.contextMenuElement.nativeElement.style.left = `${adjustedX}px`;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    this.contextMenuReference?.destroy();
  }

  hoverFn(rowClicked: any, menuItem: ContextMenuItem): void {
    if(menuItem.items) {
      // ACA SIEMPRE LLAMAR A createSubContextMenu.
      console.log(menuItem);
    }
  }

  // Function to keep track of rows using the index given by the *ngFor
  trackByFn(index: number, item: any): number {
    return index;
  }

}
