import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { SelectPageService } from 'src/app/basic-view/services/select-page.service';

@Component({
  selector: 'app-navbarelement',
  templateUrl: './navbarelement.component.html',
  styleUrls: ['./navbarelement.component.css']
})
export class NavbarElementComponent implements OnInit {

  // Boolean to set selected style to buttons;
  public selected: boolean = false;

  @Input() title!: string;
  @Input() imagePath!: string;
  @Input() viewIdReference!: string;
  @Input() buttonIndex!: string;

  @ViewChild("titleDisplayer") titleDisplayer!: ElementRef;

  // Variable to store the last item selected to avoid fetching data when spamming click
  private static lastSelectedButton: NavbarElementComponent | undefined = undefined;

  constructor(private pageChangeService: SelectPageService) { }

  ngOnInit(): void {
    // Make the first button as if the user clicked it
    if (this.buttonIndex === '0') {
      this.changePageCall();
    }
  }

  //Send a call to re-render the view with new information 
  changePageCall(): void {
    // If clicked in the same button as before
    if (this === NavbarElementComponent.lastSelectedButton) {
      return;
    }
    // Unselect the last selected button
    if (NavbarElementComponent.lastSelectedButton) {
      NavbarElementComponent.lastSelectedButton.selected = false;
    }
    NavbarElementComponent.lastSelectedButton = this;
    this.selected = true;
    this.pageChangeService.sendPageChange(this.viewIdReference);
  }

}
