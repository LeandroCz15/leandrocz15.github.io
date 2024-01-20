import { ApplicationRef, ComponentFactoryResolver, ComponentRef, EmbeddedViewRef, Injectable, Injector } from '@angular/core';
import { ContextMenuComponent, ContextMenuData } from '../context-menu/context-menu.component';

@Injectable({
  providedIn: 'root'
})
export class OpenContextMenuService {

  private contextMenusOpened: ComponentRef<ContextMenuComponent>[] = [];

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) { }

  /**
   * Create the context menu
   * @param data Data to pass to the context menu
   * @param isRoot Indicates if the current context menu being opened is root or not. If its
   * root then it will close any other context menu in the application before opening. If its not root
   * it wont close anything. This parameter is made to avoid closing subsequents context menus
   */
  public createContextMenu(data: ContextMenuData): void {
    this.contextMenusOpened.forEach(element => {
      element.destroy();
    });
    this.contextMenusOpened.splice(0);
    const contextMenuReference = this.componentFactoryResolver
      .resolveComponentFactory(ContextMenuComponent)
      .create(this.injector);
    this.appRef.attachView(contextMenuReference.hostView);
    const domElem = (contextMenuReference.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    contextMenuReference.instance.data = data;
    contextMenuReference.instance.contextMenuReference = contextMenuReference;
    document.body.append(domElem);
    this.contextMenusOpened.push(contextMenuReference);
    /*
    setTimeout(() => {
      /*
        Wait for the others context menus to deleted before opening a new one 
      const contextMenuReference = this.componentFactoryResolver
        .resolveComponentFactory(ContextMenuComponent)
        .create(this.injector);
      this.appRef.attachView(contextMenuReference.hostView);
      const domElem = (contextMenuReference.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
      contextMenuReference.instance.data = data;
      contextMenuReference.instance.contextMenuReference = contextMenuReference;
      document.body.append(domElem);
    }, 0);
    */
  }

  public createSubContextMenu(data: ContextMenuData, parentContextMenu: ComponentRef<ContextMenuComponent>): void {

  }

}
