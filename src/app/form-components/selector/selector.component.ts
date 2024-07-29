import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, forwardRef } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormControl, FormGroup, FormGroupDirective, NG_VALUE_ACCESSOR, NgForm, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Observable, Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { CazzeonService } from 'src/app/cazzeon-service/cazzeon-service';
import { DEFAULT_SELECTOR_DEBOUNCE_TIME, HttpMethod } from 'src/application-constants';
import { ServerResponse } from 'src/application-utils';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { DataType } from '../cazzeon-form-builder/cazzeon-form-builder.service';
import { CazzeonFormComponent } from '../cazzeon-form-component/cazzeon-form-component';

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

  /********************** INPUTS **********************/
  @Input() formGroup!: FormGroup;
  @Input() formControl!: FormControl;
  @Input() selectorData!: SelectorData;
  @Input() labelText!: string;
  @Input() placeHolderText?: string;
  @Input() debounceTime?: number;
  @Input() programmaticUpdate?: Subject<boolean>;

  /********************** OUTPUTS **********************/
  @Output() optionSelected = new EventEmitter<any>();

  /********************** CHILD ELEMENTS **********************/
  @ViewChild("selectorInput") selectorInput!: ElementRef;

  constructor(private cazzeonService: CazzeonService) { }

  writeValue(obj: any): void { }

  registerOnChange(fn: any): void { }

  registerOnTouched(fn: any): void { }

  setDisabledState?(isDisabled: boolean): void { }

  ngOnInit(): void {
    // Observe the value change
    this.valueChangeObservable = this.formControl.valueChanges.pipe(debounceTime(this.debounceTime || DEFAULT_SELECTOR_DEBOUNCE_TIME), distinctUntilChanged());
    // Subscribe to the change
    this.valueChangeSubscription = this.valueChangeObservable.subscribe(value => this.handleSelectorChange(value));
    if (this.programmaticUpdate) {
      /**
       * If the programmaticUpdate subject was provided to the current instance, the value change event can be disabled.
       * 
       * This is very usefull when changing the value of the selector via JS, since any change will trigger the fetch
       * and in the mentioned case is not desirable.
       */
      this.programmaticUpdateSubscription = this.programmaticUpdate.asObservable().subscribe(value => {
        if (!value) {
          this.valueChangeSubscription = this.valueChangeObservable.subscribe(value => this.handleSelectorChange(value)); // ENABLE
        } else {
          this.valueChangeSubscription.unsubscribe(); // DISABLE
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.programmaticUpdateSubscription?.unsubscribe();
    this.valueChangeSubscription.unsubscribe();
  }

  /**
   * Function executed to display a property of the rendered options.
   * 
   * @param value Option object.
   * @returns The value to show in the context menu.
   */
  showProperty(value: any) {
    return value?.identifier || '';
  }

  /**
   * Function executed when clicked on an option.
   * 
   * @param value Option clicked.
   */
  clickInOption(value: MatAutocompleteSelectedEvent): void {
    this.optionSelected.emit(value);
  }

  /**
   * Function to handle the change observed by the form pipe. This function will be
   * executed on any change on the input.
   * 
   * @param value Value entered on the input
   */
  handleSelectorChange(value: any): void {
    // Workaround to avoid fetch when the value is an object, this happens when the user chooses an option.
    if (typeof value === 'object') {
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
    }, JSON.stringify({ selectorData: this.selectorData, value: value }));
  }

}

/**
 * Selector interface with the attributes needed to properly communicate with the backend.
 */
export interface SelectorData {
  entityToSearch: string,
  propertyForMatch: string,
  identifiers: string,
  predicateExtensorName?: string
}

/**
 * Validator to check if the control value is an object.
 * 
 * @param control Form control with the value to check.
 */
export function isObjectValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return typeof control.value === 'object' || control.value === null ? null : { 'notObject': true };
  };
}

/**
 * Selector error state matcher class.
 */
export class SelectorErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid);
  }
}

export class SelectorFormComponent extends CazzeonFormComponent {

  private _selectorData: SelectorData;

  constructor(name: string, formName: string, required: boolean, selectorData: SelectorData) {
    super(name, formName, required, DataType.SELECTOR);
    this._selectorData = selectorData;
  }

  get selectorData(): SelectorData {
    return this._selectorData;
  }

  override buildFormControl = () => {
    return new FormControl(undefined, this.required ? [Validators.required, isObjectValidator()] : isObjectValidator());
  };

}
