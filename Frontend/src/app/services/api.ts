import { HttpClient, HttpHeaders } from '@angular/common/http';
  import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:4000/api/v1';
  private getHeaders() {
    const token = localStorage.getItem('accessToken');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  login(data: { email: string; password: string }) {
    return this.http.post(`${this.baseUrl}/auth/login`, data);
  }

  getMyDownline() {
    return this.http.get(`${this.baseUrl}/users/down-line-users`,{headers: this.getHeaders()});
  }

  getUserDownline(userId: string) {
    return this.http.get(`${this.baseUrl}/users/${userId}/down-line-users`,{headers: this.getHeaders()});
  }

  createUser(data: { username: string; email: string; password: string; partnership: number; commission: number;}) {
    return this.http.post(`${this.baseUrl}/users/create-user`, data, {headers: this.getHeaders()});
  }
}
