import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GenerateIdForFormPipe } from '../pipes/generate-id-for-form.pipe';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { CAZZEON_DATE_FORMAT, DataType, HttpMethod } from 'src/application-constants';
import * as bootstrap from 'bootstrap';
import { AuthService } from 'src/app/login-module/auth-service';
import { ViewComponent } from '../view/view.component';
import { RowFormFetchService } from '../services/row-form-fetch.service';

@Component({
  selector: 'app-row-form',
  templateUrl: './row-form.component.html',
  styleUrls: ['./row-form.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: CAZZEON_DATE_FORMAT }
  ]
})
export class RowFormComponent implements OnInit, OnDestroy, AfterViewInit {

  // Modal of the view
  private modalElement!: Element;

  // View component reference
  @Input() viewComponent!: ViewComponent;

  // Filters/Headers heredated from view component parent
  @Input() public filters: Array<any> = [];

  // Service to send data to a modal when clicking in a row. HEREDATED FROM PARENT
  @Input() openRowFormSubject!: Subject<any>;
  private openRowFormSubscription!: Subscription;

  // Current row to be rendered
  public currentRow: any = {};

  // Form profile
  public profileForm!: FormGroup<{}>;

  // Boolean to indicate if the form was submitted
  public submitted: boolean = false;

  constructor(private authService: AuthService, private rowFormFetch: RowFormFetchService, private formBuilder: FormBuilder, private getIdForFormPipe: GenerateIdForFormPipe) { }

  ngOnInit(): void {
    this.openRowFormSubscription = this.openRowFormSubject.asObservable().subscribe(row => this.updateModal(row));
    this.profileForm = this.formBuilder.group(this.buildGroup());
  }

  ngOnDestroy(): void {
    this.openRowFormSubscription.unsubscribe();
  }

  // Set modal element reference
  ngAfterViewInit(): void {
    this.modalElement = document.getElementById("rowModal") as Element;
  }

  /**
   * This function updates the current form with the values of the row passed as argument and then opens the modal
   * @param row Row to update the current form
   */
  updateModal(row: any): void {
    this.currentRow = row;
    Object.keys(this.profileForm.controls).forEach(key => {
      const formattedKey = this.normalizeOrFormatKey(key, true);
      this.profileForm.get(key)!.setValue(this.currentRow[formattedKey]);
    });
    bootstrap.Modal.getOrCreateInstance(this.modalElement).show();
  }

  /**
   * Build every group needed on the form based on the view filters
   * @returns 
   */
  buildGroup(): any {
    let group: any = {};
    this.filters.forEach(filter => {
      if (filter.showInGrid) {
        group[this.normalizeOrFormatKey(filter.hqlProperty, false)] = [this.getDefaultValueForGroup(filter), this.buildPropertiesForGroup(filter)];
      }
    });
    return group;
  }

  /**
   * Get the default value of a specific group
   * @param filter Filter to get default value
   * @returns Default value based on the current filter
   */
  getDefaultValueForGroup(filter: any): any {
    switch (filter.type) {
      case DataType.TEXT:
        return filter.defaultValue || undefined;
      case DataType.CHECKBOX:
        return filter.defaultValue as boolean || false;
      case DataType.NUMERIC:
        return +filter.defaultValue || undefined;
      case DataType.DATE:
        return filter.defaultValue || undefined;
      default:
        return undefined;
    }
  }

  /**
   * This function derivates the creation of a specific group to a specific function
   * @param filter Filter to build the group
   * @returns A group for the form builder
   */
  buildPropertiesForGroup(filter: any): Array<any> {
    switch (filter.type) {
      case DataType.TEXT:
        return this.buildTextValidators(filter);
      case DataType.CHECKBOX:
        return [];
      case DataType.NUMERIC:
        return this.buildNumericValidators(filter);
      case DataType.DATE:
        return this.buildDateValidators(filter);
      default:
        return [];
    }
  }

  /**
   * Build text validators
   * @param filter Filter to build the validator
   * 
   * @returns An array of validators for text type
   */
  buildTextValidators(filter: any): Array<any> {
    const properties: Array<any> = [];
    if (filter.isMandatory) {
      properties.push(Validators.required);
      properties.push(this.noWhitespaceValidator);
    }
    return properties;
  }

  /**
   * Build numeric validators
   * @param filter Filter to build the validator
   * 
   * @returns An array of validators for numeric type
   */
  buildNumericValidators(filter: any): Array<any> {
    const properties: Array<any> = [];
    if (filter.isMandatory) {
      properties.push(Validators.required);
    }
    return properties;
  }

  /**
   * Build date validators
   * @param filter Filter to build the validator
   * 
   * @returns An array of validators for date type
   */
  buildDateValidators(filter: any): Array<any> {
    const properties: Array<any> = [];
    if (filter.isMandatory) {
      properties.push(Validators.required);
    }
    return properties;
  }

  /**
   * Function needed to update checkbox value since binding the form is not working 
   */
  updateFormCheckBox(controlStringValue: string, value: boolean): void {
    this.profileForm.get(controlStringValue)!.patchValue(value);
  }

  // New validator to check that a text input must not be blank
  noWhitespaceValidator(control: FormControl): any {
    return (control.value || '').trim().length ? null : { 'blank': true };
  }

  /**
   * Submit the form
   */
  onSubmit(): void {
    if (!this.profileForm.valid) {
      return;
    }
    this.submitted = true;
    const url = `api/store/${this.viewComponent.mainTabEntityName}`;
    this.updateRowWithCurrentFormValues();
    this.authService.fetchInformation(url, HttpMethod.POST, async (response: Response) => {
      const jsonResponse: any = await response.json();
      this.updateRowWithBackendResponse(jsonResponse);
      this.submitted = false;
    }, async (response: Response) => {
      this.submitted = false;
      console.error(`Error while storing entity ${this.viewComponent.mainTabEntityName}. Cause: ${await response.text()}`);
    }, (error: any) => {
      this.submitted = false;
      console.error(`Timeout in when storing an object of type: ${this.viewComponent.mainTabEntityName}`);
    },
      JSON.stringify(this.currentRow));
  }

  /**
   * This function updates the current row of the component with all the values retrieved from the backend.
   * This is needed if the insert/update makes third changes to the current row. Then it sends a call to the row component
   * to also update the current row in the grid
   */
  updateRowWithBackendResponse(updatedRow: any): void {
    Object.keys(this.currentRow).forEach(key => {
      // Update the form properties that has been found
      const formattedKey = this.normalizeOrFormatKey(key, false);
      const valueToSet = this.getValueToSetFromRow(key, updatedRow[key]);
      this.profileForm.get(formattedKey)?.setValue(valueToSet);
      // Update current row properties
      this.currentRow[key] = valueToSet;
    });
    this.rowFormFetch.sendRowFetchChange(Object.assign({}, this.currentRow));
  }

  /**
   * This function is meant to return a specific value from a fresh row fetched from the backend.
   * For example backend sends date in string format. This function is made for those exceptions that needs to be converted
   */
  getValueToSetFromRow(key: string, value: any): any {
    switch (this.viewComponent.currentTabFiltersIndexedByHqlProperty[key].type) {
      case DataType.DATE:
        return new Date(value);
      default:
        return value;
    }
  }

  /**
   * This function updates the current row of the component with all the values in the form.
   * This is needed so when the current row is stringified every value sent to backend is correct 
   */
  updateRowWithCurrentFormValues(): void {
    const formRawValue: any = this.profileForm.getRawValue();
    Object.keys(this.profileForm.getRawValue()).forEach(key => {
      // Normalize object
      const normalizedKey = this.normalizeOrFormatKey(key, true);
      this.currentRow[normalizedKey] = formRawValue[key];
    });
  }

  // Normalize the key or format. If normalize then is the standard hql property. Else is the format: form_ + property
  normalizeOrFormatKey(key: string, doNormalize: boolean): string {
    return doNormalize ? key.replace("form_", "").replaceAll("_", ".") : this.getIdForFormPipe.transform(key);
  }

  // Getter for easy access to form fields
  get form() {
    return this.profileForm;
  }

  // Function to keep track of rows using the index given by the *ngFor
  trackByFn(index: number, item: any): number {
    return index;
  }

}
