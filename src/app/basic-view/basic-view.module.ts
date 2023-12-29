import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { RowsComponent } from './rows/rows.component';
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
import {MatSelectModule} from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@NgModule({
  declarations: [
    HeaderComponent,
    RowsComponent,
    ViewComponent,
    PaginationComponent,
    ShouldShowPipe,
    RowFormComponent,
    GenerateIdForFormPipe,
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
    MatSelectModule,
    NgxMatSelectSearchModule,
  ],
  exports: [
    ViewComponent,
  ],
  providers: [
    GenerateIdForFormPipe,
  ]
})
export class BasicViewModule { }
