import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { CazzeonService } from 'src/app/cazzeon-service/cazzeon-service';
import { MyErrorStateMatcher, RowFormComponent } from '../row-form/row-form.component';
import { HttpMethod } from 'src/application-constants';
import { Type } from '@angular/compiler';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.css']
})
export class SelectorComponent implements OnInit, OnDestroy {

  @Input() formInput!: FormGroup<{}>;

  @Input() filter!: any;

  @Input() formName!: string;

  @Input() rowFormComponent!: RowFormComponent;

  @Input() programmaticUpdate!: Subject<boolean>;

  @Input() matcher!: MyErrorStateMatcher;

  private programmaticUpdateSubscription!: Subscription;

  private valueChangeObservable!: Observable<any>;

  private valueChangeSubscription!: Subscription;

  public resultSet: any[] = [];

  private lastOptionIdClicked: string = "";

  constructor(private cazzeonService: CazzeonService) { }

  ngOnInit(): void {
    this.valueChangeObservable = this.formInput.get(this.formName)!.valueChanges.pipe(debounceTime(950), distinctUntilChanged())
    this.valueChangeSubscription = this.valueChangeObservable.subscribe(value => this.handleSelectorChange(value));
    this.programmaticUpdateSubscription = this.programmaticUpdate.asObservable().subscribe(value => {
      if (!value) {
        this.valueChangeSubscription = this.valueChangeObservable.subscribe(value => this.handleSelectorChange(value));
      } else {
        // DISABLE
        this.valueChangeSubscription.unsubscribe();
      }
    });
  }

  ngOnDestroy(): void {
    this.programmaticUpdateSubscription.unsubscribe();
    this.valueChangeSubscription.unsubscribe();
  }

  showProperty(value: any) {
    return value?.identifier || "";
  }

  clickInOption(value: string): void {
    this.lastOptionIdClicked = value;
  }

  handleSelectorChange(value: any): void {
    // Workaround to avoid fetch when clicking in a value 
    if (value?.id === this.lastOptionIdClicked) {
      return;
    }
    const url: string = `api/data/selector?entityFrom=${this.rowFormComponent.data.tabData.tab.entityName}`;
    const selectorDetails: any = { rowFromId: this.rowFormComponent.data.currentRow.id, fieldOfSelector: this.filter, value: value };
    this.cazzeonService.request(url, HttpMethod.POST, async (response: Response) => {
      this.resultSet = await response.json();
    }, async (response: Response) => {
      console.error(`Error while fetching data for the selector ${this.rowFormComponent.data.tabData.tab.entityName}: ${await response.text()}`);
    }, (error: TypeError) => {
      console.error(`Error while fetching data for the selector ${this.rowFormComponent.data.tabData.tab.entityName}: ${error.message}`);
    }, JSON.stringify(selectorDetails));
  }

}