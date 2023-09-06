import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from './product-card/product-card.component';
import { ProductViewComponent } from './product-view/product-view.component';
import { ProductModalComponent } from './product-modal/product-modal.component';
import { Credentials } from '../login-module/credentials';
import { CdkDrag } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    ProductCardComponent,
    ProductViewComponent,
    ProductModalComponent,
  ],
  imports: [
    CommonModule,
    CdkDrag
  ],
  exports: [
    ProductCardComponent,
    ProductViewComponent,
    ProductModalComponent,
  ],
  providers: [
    Credentials,
  ]
})
export class ProductModule { }
