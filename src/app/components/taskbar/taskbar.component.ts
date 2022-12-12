import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Issue } from 'src/app/classes/issue/issue';

@Component({
  selector: 'app-taskbar',
  templateUrl: './taskbar.component.html',
  styleUrls: ['./taskbar.component.css']
})
export class TaskbarComponent {
  @Input() issuesParam! : Issue[];
  @Input() issuesToInputParam! : Issue[];
  @Input() loginDomain! : string;
  @Input() loginEmail! : string;
  @Input() loginToken! : string;
  @Output() changeCurrentIssueEvent = new EventEmitter<Issue>();

  filterByInputedChk : boolean = false;
  isLoading : boolean = false;
  filterArray : string[] = ["Open", "En test", "Closed", "In progress"];

  changeCheckValue(){
    this.filterByInputedChk = !this.filterByInputedChk;
  }
  
  emitIssueEvent(issue: Issue) {
    this.changeCurrentIssueEvent.emit(issue);
  }

  async getIssues(){
    await fetch(herokuappUrl + jiraSearchUrl, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + btoa(this.loginEmail + ':' + this.loginToken),
        'Accept': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      this.issuesParam.splice(0);
        data.issues.forEach((issue: { id: string; key: string; fields: { summary: string; timeoriginalestimate: number; timespent: number; status: { name: string; statusCategory: { id: number; }; }; }; }) => {
          if(!this.checkExistingIssue(issue.id)){
            this.issuesParam.push(new Issue(
              issue.id,
              issue.key,
              issue.fields.summary,
              issue.fields.timeoriginalestimate,
              issue.fields.timespent,
              issue.fields.status.name,
              issue.fields.status.statusCategory.id));
          }
        });
      });
    }

    checkExistingIssue(id : string) {
      let returnValue : boolean = false;
      this.issuesToInputParam.forEach(issue => {
        if(issue.id === id){
          returnValue = true;
        }
      })
      return returnValue;
    }

    filterIssue(issue : Issue){
      for(let i=0 ; i < this.filterArray.length ; i++){
        if(false || this.filterArray[i].toLocaleLowerCase() === issue.statusName.toLowerCase()){
          return true
        }
      }
      return false;
    }

    filterIssueByName(inputString : string){
      if(inputString[0] !== undefined){
      this.issuesParam.forEach(issue =>{
          let lowerCaseInput = inputString.toLowerCase();
          issue.hidden = !issue.key.toLowerCase().includes(lowerCaseInput) && !issue.summary.toLowerCase().includes(lowerCaseInput);      
        });
      } else{
        this.issuesParam.forEach(issue =>{
          issue.hidden = false;
        });
      }
    }
  
}

const herokuappUrl : string = "https://guarded-reef-52511.herokuapp.com/";
const jiraSearchUrl : string = "https://etendoproject.atlassian.net/rest/api/3/search?jql=assignee=currentUser()";

