import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataType } from '../cazzeon-form-builder/cazzeon-form-builder.service';
import { CazzeonFormComponent } from '../cazzeon-form-component';

export enum FileExtension {
  JPEG = "image/jpeg",
  PNG = "image/png",
  PDF = "application/pdf",
  XLS = "application/vnd.ms-excel",
  XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ZIP = "application/zip",
  RAR = "application/vnd.rar",
  TXT = "text/plain",
  SVG = "image/svg+xml",
  TAR = "application/x-tar",
  PPT = "application/vnd.ms-powerpoint",
  JSON = "application/json",
  DOC = "application/msword",
  CSV = "text/csv"
}

export interface FileUploaderData {
  maxFileSize: number
  fileExtension: FileExtension
}

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploaderComponent),
      multi: true
    }
  ]
})
export class FileUploaderComponent implements ControlValueAccessor {

  /********************** COMPONENT ATTRIBUTES **********************/
  private reader: FileReader = new FileReader();

  /********************** INPUTS **********************/
  @Input() formGroup!: FormGroup;
  @Input() formControl!: FormControl;
  @Input() fileUploaderData!: FileUploaderData;

  writeValue(obj: any): void { }

  registerOnChange(fn: any): void { }

  registerOnTouched(fn: any): void { }

  setDisabledState?(isDisabled: boolean): void { }

  /**
   * This function will handle the file change event. If every validation is passed then
   * the input will contain a base 64 generated with the file uploaded.
   * 
   * @param event File change event
   */
  handleFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files![0];
    if (file.size > this.fileUploaderData.maxFileSize) {
      this.formControl.setErrors({ "maxSizeViolation": true });
      return;
    }
    if (file.type !== this.fileUploaderData.fileExtension) {
      this.formControl.setErrors({ "invalidExtension": true });
      return;
    }
    this.reader.readAsDataURL(file);
    this.reader.onload = () => {
      if (this.reader.result) {
        try {
          this.formControl.setValue(this.reader.result);
        } catch (ignore: any) {
          // Ignore DOM Exception because the value is set as a base 64 anyways
          console.warn(ignore);
        }
      }
    };
  }

}

export class FileUploaderFormComponent extends CazzeonFormComponent {

  private _maxFileSize: number;
  private _fileExtension: FileExtension;

  constructor(name: string, formName: string, required: boolean, fileUploaderData: FileUploaderData) {
    super(name, formName, required, DataType.FILE);
    this._maxFileSize = fileUploaderData.maxFileSize;
    this._fileExtension = fileUploaderData.fileExtension;
  }

  get maxFileSize(): number {
    return this._maxFileSize;
  }

  get fileExtension(): FileExtension {
    return this._fileExtension;
  }

  override buildFormControl = () => {
    return new FormControl(undefined, this.required ? Validators.required : undefined);
  }

}
