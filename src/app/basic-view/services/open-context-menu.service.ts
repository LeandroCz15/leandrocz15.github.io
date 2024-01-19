import { ApplicationRef, ComponentFactoryResolver, ComponentRef, EmbeddedViewRef, Injectable, Injector } from '@angular/core';
import { ContextMenuComponent, ContextMenuData } from '../context-menu/context-menu.component';

@Injectable({
  providedIn: 'root'
})
export class OpenContextMenuService {

  private componentRef!: ComponentRef<ContextMenuComponent>;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) { }

  openContextMenu(data: ContextMenuData) {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
    this.componentRef = this.componentFactoryResolver
      .resolveComponentFactory(ContextMenuComponent)
      .create(this.injector);
    this.appRef.attachView(this.componentRef.hostView);
    const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    this.componentRef.instance.data = data;
    this.componentRef.instance.componentRef = this.componentRef;
    document.body.append(domElem);
  }

}
