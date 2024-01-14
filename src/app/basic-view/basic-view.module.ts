import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { GridComponent } from './grid/grid.component';
import { ViewComponent } from './view/view.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PaginationComponent } from './pagination/pagination.component';
import { ShouldShowPipe } from './pipes/should-show.pipe';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RowFormComponent } from './row-form/row-form.component';
import { GenerateIdForFormPipe } from './pipes/generate-id-for-form.pipe';
import { MatInputModule } from '@angular/material/input';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SelectorComponent } from './selector/selector.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DisplayEmptyValuePipe } from './pipes/display-empty-value.pipe';
import { RowComponent } from './row/row.component';

@NgModule({
  declarations: [
    HeaderComponent,
    GridComponent,
    ViewComponent,
    PaginationComponent,
    ShouldShowPipe,
    RowFormComponent,
    GenerateIdForFormPipe,
    SelectorComponent,
    DisplayEmptyValuePipe,
    RowComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    NgbModule,
    MatAutocompleteModule,
    MatDialogModule
  ],
  exports: [
    ViewComponent,
  ],
  providers: [
    GenerateIdForFormPipe,
  ]
})
export class BasicViewModule { }
