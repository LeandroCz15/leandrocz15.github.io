import { Component, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { FormControl, FormGroup, FormGroupDirective, NgForm, NonNullableFormBuilder, Validators } from '@angular/forms';
import { GenerateIdForFormPipe } from '../../pipes/generate-id-for-form.pipe';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { CAZZEON_DATE_FORMAT, DataType, HttpMethod } from 'src/application-constants';
import { CazzeonService } from 'src/app/cazzeon-service/cazzeon-service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { isObjectValidator, noWhitespaceValidator } from 'src/application-utils';
import { TabData } from '../../interfaces/tab-structure';

export interface DialogData {
  currentRow: any,
  tabData: TabData,
  allRows: any[]
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

  /********************** COMPONENT ATTRIBUTES **********************/
  public formReady: boolean = false; // Boolean to render the modal 
  public matcher: MyErrorStateMatcher; // Variable to store the matcher that will control the errors in the angular-material inputs (date, selector)
  private profileForm: FormGroup<{}>; // Form profile

  /********************** SUBJECTS **********************/
  public programmaticUpdate: Subject<boolean> = new Subject<boolean>; // Subject for update the form

  constructor(
    private cazzeonService: CazzeonService,
    private formBuilder: NonNullableFormBuilder,
    private getIdForFormPipe: GenerateIdForFormPipe,
    private dialogRef: MatDialogRef<RowFormComponent>,
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
      case DataType.INTEGER:
      case DataType.DECIMAL:
        return filter.isMandatory ? [Validators.required, Validators.pattern(/^\d+$/)] : [Validators.pattern(/^\d+$/)];
      case DataType.DATE:
        return filter.isMandatory ? [Validators.required] : [];
      case DataType.SELECTOR:
        return filter.isMandatory ? [Validators.required, isObjectValidator] : [isObjectValidator];
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
      const jsonResponse: any = await response.json();
      this.updateRowAndFormWithBackendResponse(jsonResponse);
      this.formReady = true;
    }, async (response: Response) => {
      this.formReady = true;
      console.error(`Error while storing entity: ${this.data.tabData.tab.entityName}. Error: ${await response.text()}`);
    }, (error: any) => {
      this.formReady = true;
      console.error(`Timeout while storing entity: ${this.data.tabData.tab.entitynName}`);
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
   * @param value Value to be converted
   */
  convertToNullIfEmptyString(value: any): any {
    if (typeof value === "string") {
      const trimmedValue = value.trim();
      return trimmedValue === "" ? null : trimmedValue;
    }
    return value
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
    this.data.tabData.formFields.forEach((field: any) => {
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
