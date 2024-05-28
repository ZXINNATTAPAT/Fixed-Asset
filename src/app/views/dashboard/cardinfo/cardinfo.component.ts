import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardBodyComponent, CardComponent, CardHeaderComponent, ColComponent, FormDirective, FormLabelDirective, RowComponent, TextColorDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-cardinfo',
  standalone: true,
  imports: [CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    RowComponent,
    ColComponent,
    TextColorDirective,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IconDirective,
    FormDirective,
    FormLabelDirective],
  templateUrl: './cardinfo.component.html',
  styleUrl: './cardinfo.component.scss'
})
export class CardinfoComponent {

  userinfo: any = [];
  token: any;

  readinfo() {
    this.token = localStorage.getItem('token');
    
    const decodedToken = jwtDecode(this.token);
    
    this.userinfo = decodedToken;
    // console.log(this.userinfo);
  }



}
