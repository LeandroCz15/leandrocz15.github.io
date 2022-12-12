import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-navbarelement',
  templateUrl: './navbarelement.component.html',
  styleUrls: ['./navbarelement.component.css']
})
export class NavbarElementComponent {
  @Input() title! : string;
  @Input() imagePath! : string;
  @Input() pageNumber! : string;
  @Output() changePage = new EventEmitter<string>();

  changePageCall(){
    this.changePage.emit(this.pageNumber);
  }
}
