// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { ApiService } from './apiservice/api-service.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class SessionService {
//   private isLoggedInSubject = new BehaviorSubject<boolean>(false);

//   constructor(private authService: ApiService) {}

//   checkSession(): void {
//     this.authService.isLoggedIn().subscribe((status) => {
//       this.isLoggedInSubject.next(status);
//     });
//   }

//   getIsLoggedIn(): Observable<boolean> {
//     return this.isLoggedInSubject.asObservable();
//   }
// }
