import { Component, ElementRef, ViewChild } from '@angular/core';
import { ToggleSidebarService } from '../services/toggle-sidebar.service';

@Component({
  selector: 'app-top-navbar',
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.css']
})
export class TopNavbarComponent {

  private arrowToggled = false;

  @ViewChild("sidebarToggler") sidebarToggler!: ElementRef;

  constructor(private toggleSidebarService: ToggleSidebarService) { }

  toggleSidebar(): void {
    this.arrowToggled = !this.arrowToggled;
    this.sidebarToggler.nativeElement.src = this.arrowToggled ? "assets/right-arrow.svg" : "assets/left-arrow.svg";
    this.toggleSidebarService.sendToggle(this.arrowToggled);
  }

}
