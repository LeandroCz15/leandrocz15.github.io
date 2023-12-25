import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { RowsComponent } from './rows/rows.component';
import { ViewComponent } from './view/view.component';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PaginationComponent } from './pagination/pagination.component';
import { ShouldShowPipe } from './should-show.pipe';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RowFormComponent } from './row-form/row-form.component';




@NgModule({
  declarations: [
    HeaderComponent,
    RowsComponent,
    ViewComponent,
    PaginationComponent,
    ShouldShowPipe,
    RowFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatFormFieldModule,
    BrowserModule,
    BrowserAnimationsModule
  ],
  exports: [
    ViewComponent
  ]
})
export class BasicViewModule { }
