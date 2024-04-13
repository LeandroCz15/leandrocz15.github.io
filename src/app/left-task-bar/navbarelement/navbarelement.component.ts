import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SelectPageService } from 'src/app/basic-view/services/select-page.service';

@Component({
  selector: 'app-navbarelement',
  templateUrl: './navbarelement.component.html',
  styleUrls: ['./navbarelement.component.css']
})
export class NavbarElementComponent implements OnInit {

  /********************** COMPONENT ATTRIBUTES **********************/
  public selected: boolean = false; // Boolean to set selected style to buttons;
  @Input() title!: string;
  @Input() imagePath!: string;
  @Input() viewIdReference!: string;
  @Input() buttonIndex!: string;
  @ViewChild("titleDisplayer") titleDisplayer!: ElementRef;

  /********************** SUBSCRIPTIONS  **********************/
  private pageChangeServiceSubscription!: Subscription;

  constructor(public pageChangeService: SelectPageService) { }

  ngOnInit(): void {
    this.pageChangeServiceSubscription = this.pageChangeService.getPageChangeObservable().subscribe(viewId => this.processViewChange(viewId));
    // Make the first button as if the user clicked it
    if (this.buttonIndex === "0") {
      this.pageChangeService.sendPageChange(this.viewIdReference);
    }
  }

  /**
   * This function reacts to a view change made via SelectPageService. This is made to 
   * update the buttons of the left taskbar properly
   */
  processViewChange(viewId: string): void {
    // At this point it is validated that the clicked view is different from the current one. This validation is just for styling
    this.selected = this.viewIdReference === viewId;
  }

}