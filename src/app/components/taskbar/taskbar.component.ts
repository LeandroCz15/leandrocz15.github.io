import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Issue } from 'src/app/classes/issue/issue';
import { JiraLoginCredentials } from 'src/app/classes/jira-login-credentials/jira-login-credentials';

@Component({
  selector: 'app-taskbar',
  templateUrl: './taskbar.component.html',
  styleUrls: ['./taskbar.component.css']
})
export class TaskbarComponent {
  @Input() issuesParam! : Issue[];
  @Input() issuesToInputParam! : Issue[];
  @Input() fetchJiraCredentials! : JiraLoginCredentials | null;
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
        'Authorization': 'Basic ' + btoa(this.fetchJiraCredentials!.email + ':' + this.fetchJiraCredentials!.token),
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

    inputIssues(){
      this.issuesToInputParam.forEach(issue => {
        let data = {
          url: this.fetchJiraCredentials!.domain,
          issue: issue.key,
          email: this.fetchJiraCredentials!.email,
          token: this.fetchJiraCredentials!.token,
          seconds: (issue.loggedHours * 60 * 60) + (issue.loggedMinutes * 60),
          text: issue.loggedText
        }
        fetch("https://leandrobalancer-1914303512.sa-east-1.elb.amazonaws.com/Jira", {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(this.fetchJiraCredentials!.email + ':' + this.fetchJiraCredentials!.token),
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': 'https://leandrocz15.github.io/'
          },
          body: JSON.stringify(data)
        }).then(response => {
          if(response.ok){
            this.issuesToInputParam.splice(this.issuesToInputParam.indexOf(issue), 1);
          }
        });
      });
      //empieza peticion.
      //esconder issues.
      //mostrar carga.
      //termina peticion.
      //mover issues a arreglo de issues no inputados.
    }
  
}

const herokuappUrl : string = "https://guarded-reef-52511.herokuapp.com/";
const jiraSearchUrl : string = "https://etendoproject.atlassian.net/rest/api/3/search?jql=assignee=currentUser()";

