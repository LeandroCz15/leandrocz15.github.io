import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ToggleSidebarService } from '../services/toggle-sidebar.service';

@Component({
  selector: 'app-top-navbar',
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.css']
})
export class TopNavbarComponent implements AfterViewInit {

  private arrowToggled = false;

  @ViewChild("sidebarToggler") sidebarToggler!: ElementRef;

  constructor(private toggleSidebarService: ToggleSidebarService) { }

  ngAfterViewInit(): void {
    //this.removeExtraFadeFromOffcanvas();
  }

  removeExtraFadeFromOffcanvas(): void {
    /**
     * JS based solution to avoid offcanvas showing 2 fades. Forcing the user to click 2 times to close the offcanvas.
     * This solution doesn't remove the style element created in the <body>. There's still issues related to offcanvas.
     * In every odd number of oppening the backdrop hides itself. 
     * 
     * For now prevent offcanvas to hide when click outside. Since it seems to work properly when closed with the cross or escape key
     */
    const myOffcanvas = document.getElementById("offcanvasDarkNavbar");
    myOffcanvas!.addEventListener("shown.bs.offcanvas", event => {
      const fade = document.getElementsByClassName("offcanvas-backdrop fade show");
      if (fade.length > 1) {
        for (let i = 1; i < fade.length; i++) {
          fade[i].remove();
        }
      }
    });
  }

  toggleSidebar(): void {
    this.arrowToggled = !this.arrowToggled;
    this.sidebarToggler.nativeElement.src = this.arrowToggled ? "assets/right-arrow.svg" : "assets/left-arrow.svg";
    this.toggleSidebarService.sendToggle(this.arrowToggled);
  }

}
