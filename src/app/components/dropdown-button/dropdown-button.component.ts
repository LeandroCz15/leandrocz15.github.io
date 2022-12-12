import { Component, Input } from '@angular/core';
import { Issue } from 'src/app/classes/issue/issue';
import { Transitions } from 'src/app/classes/transitions/transitions';

@Component({
  selector: 'app-dropdown-button',
  templateUrl: './dropdown-button.component.html',
  styleUrls: ['./dropdown-button.component.css']
})
export class DropdownButtonComponent {
  @Input() issue! : Issue;
  @Input() loginDomain! : string;
  @Input() loginEmail! : string;
  @Input() loginToken! : string;


  transitions : Transitions[] = [];
  isLoading : boolean = false;

  async getTransitions(){
    this.transitions.splice(0);
    this.isLoading = true;
    await fetch(herokuappUrl + jiraSearchUrl + this.issue.id + "/transitions", {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + btoa(this.loginEmail + ':' + this.loginToken),
        'Accept': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      data.transitions.forEach((element: { id: string; name: string; to: { id: string; statusCategory: { id: string; }; }; }) => {
        this.transitions.push(new Transitions(element.id, element.name, element.to.id, element.to.statusCategory.id));
      });
    });
    this.isLoading = false;
  }
}

const herokuappUrl : string = "https://guarded-reef-52511.herokuapp.com/";
const jiraSearchUrl : string = "https://etendoproject.atlassian.net/rest/api/3/issue/";
