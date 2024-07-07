import { Component, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { FormControl, FormGroup, FormGroupDirective, NgForm, NonNullableFormBuilder, Validators } from '@angular/forms';
import { GenerateIdForFormPipe } from '../../pipes/generate-id-for-form.pipe';
import { ErrorStateMatcher } from '@angular/material/core';
import { CazzeonService } from 'src/app/cazzeon-service/cazzeon-service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ServerResponse, noWhitespaceValidator } from 'src/application-utils';
import { TabData } from '../../interfaces/tab-structure';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { HttpMethod, SNACKBAR } from 'src/application-constants';
import { DataType } from 'src/app/form-components/cazzeon-form-builder/cazzeon-form-builder.service';
import { isObjectValidator } from 'src/app/form-components/selector/selector.component';

export interface DialogData {
  currentRow: any,
  tabData: TabData,
  allRows: any[]
}

class DateErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid);
  }
}

const CURRENT_DATE = "CURRENT_DATE";

@Component({
  selector: 'app-row-form',
  templateUrl: './row-form.component.html',
  styleUrls: ['./row-form.component.css']
})
export class RowFormComponent {

  /********************** COMPONENT ATTRIBUTES **********************/
  public formReady: boolean = false; // Boolean to render the modal
  public dateMatcher: DateErrorMatcher = new DateErrorMatcher();
  private profileForm: FormGroup<{}>; // Form profile

  /********************** SUBJECTS **********************/
  public programmaticUpdate: Subject<boolean> = new Subject<boolean>; // Subject for update the form

  constructor(
    private cazzeonService: CazzeonService,
    private snackBar: MatSnackBar,
    private formBuilder: NonNullableFormBuilder,
    private getIdForFormPipe: GenerateIdForFormPipe,
    private dialogRef: MatDialogRef<RowFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
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
    this.data.tabData!.formFields.forEach((field: any) => {
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
        return filter.isMandatory ? [Validators.required, noWhitespaceValidator] : [];
      case DataType.NATURAL:
        return filter.isMandatory ? [Validators.required, Validators.pattern(/^[1-9]\d*$/)] : [Validators.pattern(/^[1-9]\d*$/)];
      case DataType.INTEGER:
        return filter.isMandatory ? [Validators.required, Validators.pattern(/^-?\d+$/)] : [Validators.pattern(/^-?\d+$/)];
      case DataType.DECIMAL:
        return filter.isMandatory ? [Validators.required, Validators.pattern(/^[1-9]\d*(\.\d{1,2})?$/)] : [Validators.pattern(/^[1-9]\d*(\.\d{1,2})?$/)];
      case DataType.DATE:
        return filter.isMandatory ? [Validators.required] : [];
      case DataType.SELECTOR:
        return filter.isMandatory ? [Validators.required, isObjectValidator()] : [isObjectValidator()];
      default:
        return [];
    }
  }

  /**
   * This function saves or update a single entity. The entity saved/updated will be the current entity displayed in the modal
   */
  onSubmit(): void {
    if (!this.profileForm.valid) {
      return;
    }
    this.formReady = false;
    const parentObject = { id: this.data.tabData.clickedRow?.id, hqlConnectionProperty: this.data.tabData.tab.hqlConnectionProperty };
    this.cazzeonService.request(`api/entity/store/${this.data.tabData.tab.entityName}`, HttpMethod.POST, async (response: Response) => {
      const jsonResponse: ServerResponse = await response.json();
      // Update the row with the values from backend
      this.updateRowAndFormWithBackendResponse(jsonResponse.body);
      this.formReady = true;
      this.snackBar.openFromComponent(SnackbarComponent, {
        duration: SNACKBAR.defaultSuccessDuration,
        data: jsonResponse
      });
    }, async (response: Response) => {
      this.formReady = true;
      const jsonResponse: ServerResponse = await response.json();
      this.snackBar.openFromComponent(SnackbarComponent, {
        duration: SNACKBAR.defaultErrorDuration,
        data: jsonResponse
      });
      console.error(`Error while storing entity ${this.data.tabData.tab.entityName}: ${jsonResponse.message}`);
    }, (error: TypeError) => {
      this.formReady = true;
      console.error(`Unexpected error while sending request to save entity ${this.data.tabData.tab.entityName}: ${error.message}`);
    },
      JSON.stringify({ entity: this.buildObjectToSend(), parent: parentObject }));
  }

  /**
   * This function deletes a single entity. The entity deleted will be the current entity displayed in the modal
   */
  deleteEntity() {
    this.cazzeonService.request(`api/entity/delete/${this.data.tabData.tab.entityName}`, HttpMethod.DELETE,
      (response: Response) => {
        this.dialogRef.close();
        const indexToDelete = this.data.allRows.findIndex(row => row === this.data.currentRow);
        this.data.allRows.splice(indexToDelete, 1);
      },
      async (response: Response) => {
        console.error(`Server error while trying to delete the record with id: ${this.data.currentRow.id} of the entity: ${this.data.tabData.tab.entityName}. Error ${await response.text()}`);
      },
      (error: any) => {
        console.error(`Timeout while deleting the record with id: ${this.data.currentRow.id} of the entity: ${this.data.tabData.tab.entityName}`);
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
    const returnObject: any = { id: this.data.currentRow.id };
    Object.keys(this.profileForm.getRawValue()).forEach(key => {
      // Normalize object
      const normalizedKey = this.normalizeOrFormatKey(key, true);
      returnObject[normalizedKey] = this.convertToNullIfEmptyString(formRawValue[key]);
    });
    return returnObject;
  }

  /**
   * Convert empty string to null value to avoid filling the
   * database with ""
   * 
   * @param value Value to be converted
   */
  convertToNullIfEmptyString(value: any): any {
    if (typeof value === "string") {
      const trimmedValue = value.trim();
      return trimmedValue === "" ? null : trimmedValue;
    }
    return value;
  }

  /**
   * This function will update the form with the row values when the modal is opened
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
    // Hardcode base row id because it is always needed
    const baseRow: any = { id: null };
    this.data.tabData.formFields.forEach(field => {
      baseRow[field.hqlProperty] = null;
    });
    return baseRow;
  }

  get form(): FormGroup<{}> {
    return this.profileForm;
  }

  // Function to keep track of rows using the index given by the *ngFor
  trackByFn(index: number, item: any): number {
    return index;
  }

  showIfFunction(showIf: any) {
    try {
      return showIf ? eval(showIf) : true;
    } catch(error) {
      console.error(error);
      return true;
    }
  }

}
