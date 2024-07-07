import { Injectable } from '@angular/core';
import { CazzeonService } from '../cazzeon-service/cazzeon-service';
import { HttpMethod, SNACKBAR } from 'src/application-constants';
import { ServerResponse } from 'src/application-utils';
import { SnackbarComponent } from '../basic-view/components/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CazzeonFormBuilderService, DataType } from '../form-components/cazzeon-form-builder/cazzeon-form-builder.service';
import { FormGroup } from '@angular/forms';
import { CazzeonFormComponent } from '../form-components/cazzeon-form-component';
import { FileUploaderFormComponent } from '../form-components/file-uploader/file-uploader.component';
import { SelectorFormComponent } from '../form-components/selector/selector.component';
import { DatePickerFormComponent } from '../form-components/date-picker/date-picker.component';
import { DecimalFormComponent } from '../form-components/decimal/decimal.component';
import { IntegerFormComponent } from '../form-components/integer/integer.component';
import { NaturalFormComponent } from '../form-components/natural/natural.component';
import { TextFormComponent } from '../form-components/text/text.component';

export interface ProcessData {
  javaClass: string,
  buttonParameters: any[]
}

@Injectable({
  providedIn: 'root'
})
export class ProcessExecutorService {

  constructor(
    private cazzeonService: CazzeonService,
    private snackBar: MatSnackBar,
    private cazzeonFormBuilderService: CazzeonFormBuilderService,
  ) { }

  callProcess(rows: any[], processData: ProcessData): void {
    const elements = this.buildElements(processData);
    const openedForm = this.cazzeonFormBuilderService.openCazzeonForm(
      {
        elements: elements,
        okLabel: 'Execute',
        cancelLabel: 'Cancel',
        executionFn: (event: Event, form: FormGroup, extraData: any) => {
          if (!form.valid) {
            return;
          }
          this.cazzeonService.request(`api/execute/${extraData!.processData.javaClass}`, HttpMethod.POST, async (response: Response) => {
            const jsonResponse = await response.json();
            this.snackBar.openFromComponent(SnackbarComponent, {
              duration: SNACKBAR.defaultSuccessDuration,
              data: jsonResponse as ServerResponse
            });
          }, async (response: Response) => {
            const jsonResponse = await response.json();
            this.snackBar.openFromComponent(SnackbarComponent, {
              duration: SNACKBAR.defaultErrorDuration,
              data: jsonResponse as ServerResponse
            });
          }, (error: TypeError) => {
            console.error(`Unexpected error: ${error.message}`);
          }, JSON.stringify({ rows: extraData!.rows, processParameters: form.getRawValue() }));
          openedForm.close();
        },
        closeFn: () => { }
      },
      { rows: rows, processData: processData });
  }

  buildElements(processData: ProcessData): CazzeonFormComponent[] {
    const components: CazzeonFormComponent[] = [];
    processData.buttonParameters.forEach(btnParamter => {
      const formName = btnParamter.name.replaceAll(' ', '_').toLowerCase();
      switch (btnParamter.type) {
        case DataType.FILE:
          components.push(new FileUploaderFormComponent(btnParamter.name, formName, btnParamter.required, { fileExtension: btnParamter.fileExtension, maxFileSize: btnParamter.fileSize }));
          break;
        case DataType.SELECTOR:
          components.push(new SelectorFormComponent(btnParamter.name, formName, btnParamter.required, btnParamter.searchClass, btnParamter.propertyForMatch, btnParamter.identifiers));
          break;
        case DataType.DATE:
          components.push(new DatePickerFormComponent(btnParamter.name, formName, btnParamter.required));
          break;
        case DataType.DECIMAL:
          components.push(new DecimalFormComponent(btnParamter.name, formName, btnParamter.required));
          break;
        case DataType.INTEGER:
          components.push(new IntegerFormComponent(btnParamter.name, formName, btnParamter.required));
          break;
        case DataType.NATURAL:
          components.push(new NaturalFormComponent(btnParamter.name, formName, btnParamter.required));
          break;
        case DataType.TEXT:
        case DataType.LARGE_TEXT:
        case DataType.PASSWORD:
          components.push(new TextFormComponent(btnParamter.name, formName, btnParamter.required));
          break;
        case DataType.CHECKBOX:
          components.push();
          break;
        default:
          console.error(`Unknown type of button parameter: ${btnParamter.type}`);
      }
    });
    return components;
  }

}
