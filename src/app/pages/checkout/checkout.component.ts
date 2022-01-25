import { Component, OnInit } from '@angular/core';
import { ShoppingCartService } from './../../shared/services/shopping-cart.service';
import {tap, switchMap, delay} from 'rxjs/operators';
import { DataService } from 'src/app/shared/services/data.service';
import { Store } from 'src/app/shared/interfaces/stores.interface';
import { Details, Order } from 'src/app/shared/interfaces/order.interface';
import { Product } from '../products/interfaces/product.interfaces';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ProductsService } from '../products/services/products.service';
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  model = {
    name: 'Dominicode',
    store: '',
    shippingAddress: '',
    city: ''
  };
  isDelivery=true;
  stores: Store[] =[];
  cart:Product[] = [];
  constructor(private dataSvc: DataService,private shoppingCartsvc: ShoppingCartService,private router:Router,private productSvc: ProductsService) { 

    this.checkIfCartIsEmpty();
  }

  ngOnInit(): void {
    this.getStores();
    this.getDataCart();
    this.prepareDetails();
  }

  onPickupOrDelivery(value:boolean):void
  {
    this.isDelivery=value;
  }
  onSubmit({ value: formData }: NgForm): void {
    console.log('Guardar', formData);
    const data: Order = {
      ...formData,
      date: this.getCurrentDay(),
      isDelivery: this.isDelivery
    }
    this.dataSvc.saveOrder(data)
      .pipe(
        tap(res => console.log('Order ->', res)),
        switchMap(({ id: orderId }) => {
          const details = this.prepareDetails();
          return this.dataSvc.saveDetailsOrder({ details, orderId });
        }),
        tap(() => this.router.navigate(['/checkout/thank-you-page'])),
       delay(2000),
        tap(() => this.shoppingCartsvc.resetCart())
      )
      .subscribe();
  }
   private getStores(): void {
    this.dataSvc.getStores()
      .pipe(
        tap((stores: Store[]) => this.stores = stores))
      .subscribe()
  }

  private getCurrentDay():string
  {
    return new Date().toLocaleDateString()
  }

  private prepareDetails(): Details[] {
    const details: Details[] = [];
    this.cart.forEach((product: Product) => {
      const { id: productId, name: productName, qty: quantity, stock } = product;
      const updateStock= (stock -quantity);
      details.push({productId, productName,quantity})

      this.productSvc.updateStock(productId,updateStock).pipe().subscribe()
    })
    return details;
  }



  private getDataCart():void
  {
    this.shoppingCartsvc.cartAction$
    .pipe(
      tap((products: Product[])=>this.cart = products)
    ).subscribe()

  }
  private checkIfCartIsEmpty(): void {
    this.shoppingCartsvc.cartAction$
      .pipe(
        tap((products: Product[]) => {
          if (Array.isArray(products) && !products.length) {
            this.router.navigate(['/products']);
          }
        })
      )
      .subscribe()
  }

}
