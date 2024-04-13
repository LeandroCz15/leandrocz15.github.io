import { AfterViewInit, Component, ComponentRef, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { OpenContextMenuService } from '../../services/open-context-menu.service';

export interface ContextMenuItem {
  label: string,
  imageSource: string,
  javaClass?: string,
  tab?: any,
  clickFn?: (row: any, item: any) => void,
  items?: ContextMenuItem[],
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
export class ContextMenuComponent implements AfterViewInit, OnDestroy {

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

  ngOnDestroy(): void {
    this.childContextMenuOpenedReference?.destroy();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    this.selfContextMenuReference?.destroy();
  }

  /**
   * Handle logic on mouse enter for the current item
   * 
   * @param menuItem Menu item being hovered
   * @param event Mouse event
   * @param index Index of the item being hovered
   */
  onItemHover(menuItem: ContextMenuItem, event: MouseEvent, index: number): void {
    if (menuItem.items) {
      const data: ContextMenuData = {
        top: this.data.top + (event.currentTarget! as any).parentElement.clientHeight * index,
        left: this.data.left + this.DEFAULT_MENU_WIDTH,
        rowClicked: this.data.rowClicked,
        items: menuItem.items
      };
      this.childContextMenuOpenedReference = this.contextMenuService.createContextMenu(data, this.selfContextMenuReference);
    }
  }

  /**
   * Handle logic on mouse leave for the current item
   * 
   * @param event Mouse event
   */
  onItemHoverLeave(event: MouseEvent): void {
    const movedInCurrentMenu = this.contextMenuElement.nativeElement.contains(event.relatedTarget);
    const movedForward = this.childContextMenuOpenedReference?.instance.contextMenuElement.nativeElement.contains(event.relatedTarget) || false;
    const moveBackward = this.parentContextMenuOpenedReference?.instance.contextMenuElement.nativeElement.contains(event.relatedTarget) || false;
    const moveOutside = !movedInCurrentMenu && !movedForward && !moveBackward;
    if (movedInCurrentMenu) {
      // MOVED IN THE CURRENT MENU. ONLY DESTROY SUB-FOLDERS OF THE CURRENT ITEM
      this.childContextMenuOpenedReference?.destroy();
    } else if (moveBackward) {
      // MOVED BACKWARD. DESTROY CURRENT FOLDER. DESTROYING THE CURRENT FOLDER WILL ALSO DESTROY SUB-FOLDERS
      this.selfContextMenuReference.destroy();
    } else if (moveOutside) {
      // MOVED OUTSIDE. DESTROY EVERYTHING EXCEPT THE MAIN MENU (THOSE WHO DOESN'T HAVE PARENT)
      this.findLastContextMenuBeforeParent(this.selfContextMenuReference).destroy();
    }
    // MOVED FORWARD. DO NOTHING
  }

  /**
   * This function returns the first child context menu of the main context menu
   * 
   * @param startContextMenu Context menu from which start to go up
   * @returns The first context menu sub-folder of the main context menu
   */
  findLastContextMenuBeforeParent(startContextMenu: ComponentRef<ContextMenuComponent>): ComponentRef<ContextMenuComponent> {
    let currentContextMenu = startContextMenu;
    while (currentContextMenu.instance.parentContextMenuOpenedReference) {
      currentContextMenu = currentContextMenu.instance.parentContextMenuOpenedReference;
    }
    return currentContextMenu.instance.childContextMenuOpenedReference!;
  }

  // Function to keep track of rows using the index given by the *ngFor
  trackByFn(index: number, item: any): number {
    return index;
  }

}
