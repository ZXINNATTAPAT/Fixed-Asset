import { Component, OnInit } from '@angular/core';
import { NgStyle } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { HttpClient } from '@angular/common/http';
// import { FormsModule } from '@angular/forms'; // Import FormsModules
import axios from 'axios';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective, NgStyle]
})
export class LoginComponent implements OnInit {
  constructor(private http: HttpClient) {
    
   }

  ngOnInit(): void {
    this.http;
  }

  async login(event:Event ,username: string, password: string) {
    event.preventDefault();
    const credentials = { username, password };
    console.log(credentials);

    axios.post<any>('https://localhost:7204/api/Authorization', credentials)
      .then(response => {
        console.log(response.data);
        alert(response.data);
        localStorage.setItem('token', response.data);
        window.location.href = '/dashboard';
      })
      .catch(error => {
        console.error(error);
      });
  }

}