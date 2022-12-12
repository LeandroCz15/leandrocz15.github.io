import { Component, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Issue } from 'src/app/classes/issue/issue';


@Component({
  selector: 'app-issue-modal',
  templateUrl: './issue-modal.component.html',
  styleUrls: ['./issue-modal.component.css']
})
export class IssueModalComponent {
    @Input() issue! : Issue;
    @Output() addOrRemoveIssue = new EventEmitter<Issue>();

    timeSpentBarPrctng : string = "0";
    timeLoggedBarPrctng : string = "0";
    timePassedBarPrctng : string = "0";

    constructor() {

    }

    emitIssueEvent(issue: Issue) {
      this.addOrRemoveIssue.emit(issue);
    }

    ngOnChanges(changes: SimpleChanges){
      this.updateBars();
    }

    updateBars() : void{
      let maxValueAcceptedForIssue = this.issue.originalEstimate - this.issue.timeSpent
      let timeLogged = (this.issue.loggedHours * 3600) + (this.issue.loggedMinutes * 60);
      if(timeLogged > maxValueAcceptedForIssue){
        this.timeLoggedBarPrctng = "0";
        this.timeSpentBarPrctng = "0";
        this.timePassedBarPrctng = "100";
      } else {
        this.timePassedBarPrctng = "0";
        this.timeSpentBarPrctng = this.getTimeSpentInSeconds().toString();
        this.timeLoggedBarPrctng = ((timeLogged * 100) / this.issue.originalEstimate).toString();
      }
    }

    getTimeSpentInSeconds() : number{
      return ((this.issue.timeSpent * 100) / this.issue.originalEstimate);
    }

}

