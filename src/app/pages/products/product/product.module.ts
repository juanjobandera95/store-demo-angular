import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductsComponent } from '../products.component';

import { ProductsRoutingModule } from '../products-routing.module';
import { ProductComponent } from './product.component';
import { MaterialModule } from 'src/app/material.module';
@NgModule({
  declarations: [
    ProductsComponent,
    ProductComponent
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule,
    MaterialModule
  ]
})
export class ProductsModule { }
