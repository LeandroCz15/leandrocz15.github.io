import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, NgForm, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { CazzeonService } from 'src/app/cazzeon-service/cazzeon-service';
import { HttpMethod } from 'src/application-constants';
import { ServerResponse } from 'src/application-utils';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

class SelectorErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule
  ]
})
export class SelectorComponent implements OnInit, OnDestroy {

  /********************** COMPONENT ATTRIBUTES **********************/
  public matcher: SelectorErrorMatcher = new SelectorErrorMatcher();
  public options: any[] = [];
  private programmaticUpdateSubscription!: Subscription;
  private valueChangeObservable!: Observable<any>;
  private valueChangeSubscription!: Subscription;
  private lastOptionIdClicked: string = ""; // Id of the last element selected. This is used as a workaround to avoid fetching when click in an already selected value.

  /********************** INPUTS **********************/
  @Input() formGroup!: FormGroup<{}>; // Form in which this selector is contained
  @Input() formName!: string; // Name for the selector input
  @Input() entityToSearch!: string; // Entity to search of this selector
  @Input() hqlPropertyOfEntity!: string; // HQL property of the entity to search
  @Input() programmaticUpdate!: Subject<boolean>; // This subject should be used by the parent whenever it wants to change the value of the selector programmatically to avoid unnecesary fetch.

  constructor(private cazzeonService: CazzeonService) { }

  ngOnInit(): void {
    this.valueChangeObservable = this.formGroup.get(this.formName)!.valueChanges.pipe(debounceTime(950), distinctUntilChanged())
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
    const url: string = `api/data/selector?entityFrom=${this.entityToSearch}`;
    const selectorDetails: any = { fieldOfSelector: { hqlProperty: this.hqlPropertyOfEntity }, value: value };
    this.cazzeonService.request(url, HttpMethod.POST, async (response: Response) => {
      const jsonResponse: ServerResponse = await response.json();
      this.options = jsonResponse.body;
    }, async (response: Response) => {
      const jsonResponse: ServerResponse = await response.json();
      console.error(`Error while fetching data for the selector ${this.entityToSearch}: ${jsonResponse.message}`);
    }, (error: TypeError) => {
      console.error(`Error while fetching data for the selector ${this.entityToSearch}: ${error.message}`);
    }, JSON.stringify(selectorDetails));
  }

}