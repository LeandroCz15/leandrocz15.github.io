import { Component, Inject, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { FormControl, FormGroup, FormGroupDirective, NgForm, NonNullableFormBuilder, Validators } from '@angular/forms';
import { GenerateIdForFormPipe } from '../pipes/generate-id-for-form.pipe';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { CAZZEON_DATE_FORMAT, DataType, HttpMethod } from 'src/application-constants';
import { AuthService } from 'src/app/login-module/auth-service';
import { ViewComponent } from '../view/view.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { isObjectValidator, noWhitespaceValidator } from 'src/application-utils';

export interface DialogData {
  viewComponent: ViewComponent,
  currentRow: any
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid);
  }
}

const CURRENT_DATE = "CURRENT_DATE";

@Component({
  selector: 'app-row-form',
  templateUrl: './row-form.component.html',
  styleUrls: ['./row-form.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: CAZZEON_DATE_FORMAT }
  ]
})
export class RowFormComponent {

  // Boolean to render the modal 
  public formReady: boolean = false;

  // Variable to store the matcher that will control the errors in the angular-material inputs (date, selector)
  public matcher: MyErrorStateMatcher;

  // Subject for update the form
  public programmaticUpdate: Subject<boolean> = new Subject<boolean>;

  // Form profile
  private profileForm!: FormGroup<{}>;

  constructor(
    private authService: AuthService,
    private formBuilder: NonNullableFormBuilder,
    private getIdForFormPipe: GenerateIdForFormPipe,
    public dialogRef: MatDialogRef<RowFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    this.matcher = new MyErrorStateMatcher();
    this.profileForm = this.formBuilder.group(this.buildGroup());
    this.updateModal(this.data.currentRow);
    this.formReady = true;
  }

  /**
   * This function updates the current form modal with the values of the row passed as argument and then opens the modal
   * @param row Row to update the current form
   */
  updateModal(row: any): void {
    this.programmaticUpdate.next(true);
    if (row) {
      this.updateFormWithRowValues();
    } else {
      this.data.currentRow = this.buildBaseRowStructure();
    }
    this.programmaticUpdate.next(false);
  }

  /**
   * Build every group needed on the form based on the view filters
   * @returns The group for the form
   */
  buildGroup(): any {
    const group: any = {};
    this.data.viewComponent.formFields.forEach((field: any) => {
      group[this.normalizeOrFormatKey(field.hqlProperty, false)] = [this.getDefaultValueForGroup(field), this.buildPropertiesForGroup(field)];
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
      case DataType.LARGE_TEXT:
        return filter.defaultValue || null;
      case DataType.CHECKBOX:
        return JSON.parse(filter.defaultValue) || false;
      case DataType.NATURAL:
      case DataType.INTEGER:
      case DataType.DECIMAL:
        return +filter.defaultValue || null;
      case DataType.DATE:
        return filter.defaultValue === CURRENT_DATE ? new Date() : filter.defaultValue;
      default:
        return null;
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
      case DataType.LARGE_TEXT:
        return this.buildTextValidators(filter);
      case DataType.CHECKBOX:
        return [];
      case DataType.NATURAL:
      case DataType.INTEGER:
      case DataType.DECIMAL:
        return this.buildNumericValidators(filter);
      case DataType.DATE:
        return this.buildDateValidators(filter);
      case DataType.SELECTOR:
        return filter.isMandatory ? [Validators.required, isObjectValidator] : [isObjectValidator];
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
      properties.push(noWhitespaceValidator);
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
   * This function saves or update a single entity. The entity saved/updated will be the current entity displayed in the modal
   */
  onSubmit(): void {
    if (!this.profileForm.valid) {
      return;
    }
    this.formReady = false;
    this.authService.fetchInformation(`api/store/${this.data.viewComponent.mainTabEntityName}`, HttpMethod.POST, async (response: Response) => {
      const jsonResponse: any = await response.json();
      this.updateRowAndFormWithBackendResponse(jsonResponse);
      this.formReady = true;
    }, async (response: Response) => {
      this.formReady = true;
      console.error(`Error while storing entity: ${this.data.viewComponent.mainTabEntityName}. Error: ${await response.text()}`);
    }, (error: any) => {
      this.formReady = true;
      console.error(`Timeout while storing entity: ${this.data.viewComponent.mainTabEntityName}`);
    },
      JSON.stringify({ entity: this.buildObjectToSend() }));
  }

  /**
   * This function deletes a single entity. The entity deleted will be the current entity displayed in the modal
   */
  deleteEntity() {
    this.authService.fetchInformation(`api/delete/${this.data.viewComponent.mainTabEntityName}`, HttpMethod.DELETE,
      (response: Response) => {
        this.dialogRef.close();
        const indexToDelete = this.data.viewComponent.gridComponent.rows.findIndex(row => row === this.data.currentRow);
        this.data.viewComponent.gridComponent.rows.splice(indexToDelete, 1);
      },
      async (response: Response) => {
        console.error(`Server error while trying to delete the record with id: ${this.data.currentRow.id} of the entity: ${this.data.viewComponent.mainTabEntityName}. Error ${await response.text()}`);
      },
      (error: any) => {
        console.error(`Timeout while deleting the record with id: ${this.data.currentRow.id} of the entity: ${this.data.viewComponent.mainTabEntityName}`);
      },
      JSON.stringify({ data: [this.data.currentRow.id] }));
  }

  /**
   * This function updates the current row of the component with all the values retrieved from the backend.
   * This is needed if the insert/update makes third changes to the current row. Then it sends a call to the row component
   * to also update the current row in the grid
   */
  updateRowAndFormWithBackendResponse(updatedRow: any): void {
    this.programmaticUpdate.next(true);
    Object.keys(this.data.currentRow).forEach(key => {
      // Update the form properties that has been found
      const formattedKey = this.normalizeOrFormatKey(key, false);
      const valueToSet = updatedRow[key];
      this.profileForm.get(formattedKey)?.setValue(valueToSet);
      // Update current row properties
      this.data.currentRow[key] = valueToSet;
    });
    this.programmaticUpdate.next(false);
  }

  /**
   * Construct the object to send. It is a copy of the current row. We dont send the current row directly since
   * we need to preserve the state of the current row in case of failure
   */
  buildObjectToSend(): any {
    const formRawValue: any = this.profileForm.getRawValue();
    const returnObject: any = Object.assign({}, this.data.currentRow);
    Object.keys(this.profileForm.getRawValue()).forEach(key => {
      // Normalize object
      const normalizedKey = this.normalizeOrFormatKey(key, true);
      returnObject[normalizedKey] = formRawValue[key];
    });
    return returnObject;
  }

  /**
   * This function is needed after the update/insert in the fail case
   */
  updateFormWithRowValues(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      const formattedKey = this.normalizeOrFormatKey(key, true);
      this.profileForm.get(key)!.setValue(this.data.currentRow[formattedKey]);
    });
  }

  // Normalize the key or format. If normalize then is the standard hql property. Else is the format: form_ + property
  normalizeOrFormatKey(key: string, doNormalize: boolean): string {
    return doNormalize ? key.replace("form_", "").replaceAll("_", ".") : this.getIdForFormPipe.transform(key);
  }

  /**
   * Build the base row structure for those rows that will be created from scratch.
   * 
   * @returns A base row object with every hqlProperty equals to null
   */
  buildBaseRowStructure(): any {
    const baseRow: any = {};
    // Hardcode base row id because it is always needed
    baseRow.id = null;
    this.data.viewComponent.formFields.forEach((field: any) => {
      baseRow[field.hqlProperty] = null;
    });
    return baseRow;
  }

  get form() {
    return this.profileForm;
  }

  // Function to keep track of rows using the index given by the *ngFor
  trackByFn(index: number, item: any): number {
    return index;
  }

}
