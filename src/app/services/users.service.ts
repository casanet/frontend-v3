import { Injectable } from '@angular/core';
import { Observable, Subscriber, BehaviorSubject, Subscription } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ToasterAndErrorsService } from './toaster-and-errors.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { User } from '../../be-assets/sharedInterfaces';

@Injectable({
  providedIn: 'root'
})

export class UsersService {

  private isUsersRetrived = false;
  private userProfile: User;

  public users: User[] = [];
  public usersFeed: BehaviorSubject<User[]> = new BehaviorSubject<User[]>(this.users);


  constructor(
    private toastrAndErrorsService: ToasterAndErrorsService,
    private authService: AuthService,
    private httpClient: HttpClient) {

    this.userProfile = this.authService.userProfile.value;
    this.authService.userProfile.subscribe((userProfile) => {
      if (!userProfile || userProfile.scope !== 'adminAuth') {
        return;
      }
      this.retriveData();
    });
  }

  private async loadUsers() {
    try {
      this.users = await this.httpClient.get<User[]>(`${environment.baseUrl}/users`, {
        withCredentials: true
      }).toPromise();
      this.usersFeed.next(this.users);
    } catch (error) {
      this.isUsersRetrived = false;

      if (error.status === 403 || error.status === 401) {
        return;
      }
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  private async retriveUsers() {
    if (!this.isUsersRetrived) {
      this.isUsersRetrived = true;
      await this.loadUsers();
    }
  }

  public async createUser(user: User) {
    try {
      await this.httpClient.post(`${environment.baseUrl}/users`, user, {
        withCredentials: true
      }).toPromise();
      this.loadUsers();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async deleteUser(user: string) {
    try {
      await this.httpClient.delete(`${environment.baseUrl}/users/${user}`,{
				withCredentials: true
			}).toPromise();
      this.loadUsers();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async editUser(user: User) {
    try {
      await this.httpClient.put(`${environment.baseUrl}/users/${user.email}`, user,{
				withCredentials: true
			}).toPromise();
      this.loadUsers();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async deactivateUserSessions(user: User) {
    try {
      await this.httpClient.post(`${environment.baseUrl}/auth/logout-sessions/${user.email}`, {},{
				withCredentials: true
			}).toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async refreshData() {
    await this.loadUsers();
  }

  public async cleanUp() {
    this.isUsersRetrived = false;
    this.users = [];
  }

  public async retriveData() {
    if (this.userProfile.scope === 'adminAuth') {
      this.retriveUsers();
    }
  }

  public async requestRegistrationCode(user: User) {
    try {
      await this.httpClient.post(`${environment.baseUrl}/users/forward-auth/${user.email}`, {},{
				withCredentials: true
			}).toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async removeUserFromRemote(user: string) {
    try {
      await this.httpClient.delete(`${environment.baseUrl}/users/forward/${user}`,{
				withCredentials: true
			}).toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async requestRegiterUser(user: User, code: string) {
    try {
      await this.httpClient.post(`${environment.baseUrl}/users/forward/${user.email}`, { code: code },{
				withCredentials: true
			}).toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async getRegisteredUsers(): Promise<string[]> {
    try {
      return await this.httpClient.get<string[]>(`${environment.baseUrl}/users/forward`,{
				withCredentials: true
			}).toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
      return [];
    }
  }
}
