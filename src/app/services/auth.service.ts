import { Injectable } from '@angular/core';
import { RegisterUser } from '../models/RegisterUser';
import { Token } from '../models/Token';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserInfo } from '../models/UserInfo';
import { IsOrganization } from '../models/IsOrganization';
import { Subject } from 'rxjs';

//azure link here
const Api_Url = 'https://hoosiervolunteer.azurewebsites.net';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userInfo: Token;
  userData: Subject<{}>;
  isLoggedIn = new Subject<boolean>();
  userRole: IsOrganization;

  constructor(private _http: HttpClient, private _router: Router) { }

  register(regUserData: RegisterUser) {
    return this._http.post(`${Api_Url}/api/Account/Register`, regUserData);
  }

  login(loginInfo){
    const str = 
    `grant_type=password&username=${encodeURI(loginInfo.email)}&password=${encodeURI(loginInfo.password)}`;

    return this._http.post(`${Api_Url}/token`, str).subscribe( (token: Token) => { 
      //this.userInfo = token;
      localStorage.setItem('id_token', token.access_token);
      localStorage.setItem('user', token.userName);
      this.isLoggedIn.next(true);
      this.getRole();
      this._router.navigate(['/']);
    });
  }

  currentUser(): Observable<Object> {
    if (!localStorage.getItem('id_token')) { return new Observable(observer => observer.next(false)); }
    
    return this._http.get(`${Api_Url}/api/Account/UserInfo`, { headers: this.setHeader() });
  }

  getRole(){
    if(!localStorage.getItem('id_token')) { return new Observable(observer => observer.next(false)) }

    return this._http.get(`${Api_Url}/api/Account/GetRole`, { headers: this.setHeader() } ).subscribe((isOrganization: IsOrganization) =>{
        this.userRole = isOrganization
        localStorage.setItem('userRole', isOrganization.Role);
        console.log(localStorage.getItem('userRole'));
    }
    );
  }

  logout(): Observable<Object> {
    localStorage.clear();
    this.isLoggedIn.next(false);

    return this._http.post(`${Api_Url}/api/Account/Logout`, { headers: this.setHeader() } );
  }

  private setHeader(): HttpHeaders {
    return new HttpHeaders().set('Authorization',`Bearer ${localStorage.getItem('id_token')}`);
  }
}
