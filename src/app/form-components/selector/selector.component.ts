import { Component, Input, OnDestroy, OnInit, forwardRef } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormControl, FormGroup, FormGroupDirective, NG_VALUE_ACCESSOR, NgForm, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Observable, Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { CazzeonService } from 'src/app/cazzeon-service/cazzeon-service';
import { HttpMethod } from 'src/application-constants';
import { ServerResponse } from 'src/application-utils';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { DataType } from '../cazzeon-form-builder/cazzeon-form-builder.service';
import { CazzeonFormComponent } from '../cazzeon-form-component';

/**
 * Validator to check if the control value is an object.
 * 
 * @param control Form control
 */
export function isObjectValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return typeof control.value === "object" || control.value === null ? null : { "notObject": true };
  };
}

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectorComponent),
      multi: true
    }
  ]
})
export class SelectorComponent implements OnInit, OnDestroy, ControlValueAccessor {

  /********************** COMPONENT ATTRIBUTES **********************/
  public matcher: SelectorErrorMatcher = new SelectorErrorMatcher();
  public options: any[] = [];
  private programmaticUpdateSubscription!: Subscription;
  private valueChangeObservable!: Observable<any>;
  private valueChangeSubscription!: Subscription;
  private lastOptionIdClicked: string = ""; // Id of the last element selected. This is used as a workaround to avoid fetching when click in an already selected value

  /********************** INPUTS **********************/
  @Input() formGroup!: FormGroup; // Form in which this selector is contained
  @Input() formControlName!: string; // Name for the selector input
  @Input() selectorData!: SelectorData; // Entity to search of this selector
  @Input() programmaticUpdate?: Subject<boolean>; // This subject should be used by the parent whenever it wants to change the value of the selector programmatically to avoid unnecesary fetch

  constructor(private cazzeonService: CazzeonService) { }

  writeValue(obj: any): void { }

  registerOnChange(fn: any): void { }

  registerOnTouched(fn: any): void { }

  setDisabledState?(isDisabled: boolean): void { }

  ngOnInit(): void {
    this.valueChangeObservable = this.formGroup.get(this.formControlName)!.valueChanges.pipe(debounceTime(950), distinctUntilChanged());
    this.valueChangeSubscription = this.valueChangeObservable.subscribe(value => this.handleSelectorChange(value));
    if (this.programmaticUpdate) {
      /**
       * If a programmatic update subject was provided to the selector instance, the parent
       * has the possibility to de-activate the logic of value handling of this component, which in
       * some cases is desireable because this components does a lot of fetching
       */
      this.programmaticUpdateSubscription = this.programmaticUpdate.asObservable().subscribe(value => {
        if (!value) {
          this.valueChangeSubscription = this.valueChangeObservable.subscribe(value => this.handleSelectorChange(value));
        } else {
          // DISABLE
          this.valueChangeSubscription.unsubscribe();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.programmaticUpdateSubscription?.unsubscribe();
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
    this.cazzeonService.request(`api/data/selector?entityToSearch=${this.selectorData.entityToSearch}`, HttpMethod.POST, async (response: Response) => {
      const jsonResponse: ServerResponse = await response.json();
      this.options = jsonResponse.body;
    }, async (response: Response) => {
      const jsonResponse: ServerResponse = await response.json();
      console.error(`Error while fetching data for the selector ${this.selectorData.entityToSearch}: ${jsonResponse.message}`);
    }, (error: TypeError) => {
      console.error(`Error while fetching data for the selector ${this.selectorData.entityToSearch}: ${error.message}`);
    }, JSON.stringify({ propertyForMatch: this.selectorData.propertyForMatch, identifiers: this.selectorData.identifiers, value: value }));
  }

}

export interface SelectorData {
  entityToSearch: string,
  propertyForMatch: string,
  identifiers: string
}

export class SelectorFormComponent extends CazzeonFormComponent {

  private _entityToSearch: string;
  private _propertyForMatch: string;
  private _identifiers: string;

  constructor(name: string, formName: string, required: boolean, entityToSearch: string, propertyForMatch: string, identifiers: string) {
    super(name, formName, required, DataType.SELECTOR);
    this._entityToSearch = entityToSearch;
    this._propertyForMatch = propertyForMatch;
    this._identifiers = identifiers;
  }

  get entityToSearch(): string {
    return this._entityToSearch;
  }

  get propertyForMatch(): string {
    return this._propertyForMatch;
  }

  get identifiers(): string {
    return this._identifiers;
  }

  override buildFormControl = () => {
    return this.required
    ? new FormControl(undefined, [Validators.required, isObjectValidator()])
    : new FormControl(undefined, isObjectValidator()); 
  };

}

class SelectorErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid);
  }
}
