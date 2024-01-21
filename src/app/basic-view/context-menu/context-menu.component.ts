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
  items?: ContextMenuItem[]
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

  public selfContextMenuReference!: ComponentRef<ContextMenuComponent>;

  // Variable to store the current sub-folder opened when hovering an item of this context menu
  private childContextMenuOpenedReference: ComponentRef<ContextMenuComponent> | undefined;

  // Variable to store the current parent from which this context menu was opened
  public parentContextMenuOpenedReference: ComponentRef<ContextMenuComponent> | undefined;

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
    this.selfContextMenuReference?.destroy();
  }

  onItemHover(menuItem: ContextMenuItem): void {
    if (menuItem.items) {
      const data: ContextMenuData = { top: this.data.top, left: this.data.left + this.DEFAULT_MENU_WIDTH, rowClicked: this.data.rowClicked, items: menuItem.items };
      this.childContextMenuOpenedReference = this.contextMenuService.createContextMenu(data, this.selfContextMenuReference);
    }
  }

  /**
   * Destroy the current context menu being hovered if it exists
   */
  onItemHoverLeave(event: MouseEvent): void {
    if (this.contextMenuElement.nativeElement.contains(event.relatedTarget)) {
      // SWAP FOR ANOTHER ITEM IN THE SAME CONTEXT MENU. DESTROY CHILDREN IF IT HAS
      this.childContextMenuOpenedReference?.destroy();
    } else if (!this.childContextMenuOpenedReference?.instance.contextMenuElement.nativeElement.contains(event.relatedTarget)) {
      // DIDN'T SWAP FOR A CHILD ELEMENT. THIS MEANS IT JUST GOT OUT OF THE CURRENT CONTEXT MENU SO DESTROY IT
      this.selfContextMenuReference.destroy();
    }
  }

  /**
   * 
   * @param event Mouse leave event
   * @param childMenu Child menu of the current context menu
   * @returns True if the mouse leave event ended selecting the child context menu of the current context menu. False otherwsie.
   * This is done because we dont want to close the current menu if the mouse is leaving for a sub-menu of the current menu
   */
  isMouseLeaveSelectingChild(event: MouseEvent, childMenu: ComponentRef<ContextMenuComponent>): boolean {
    return childMenu.instance.contextMenuElement.nativeElement.contains(event.relatedTarget);
  }

  // Function to keep track of rows using the index given by the *ngFor
  trackByFn(index: number, item: any): number {
    return index;
  }

}
