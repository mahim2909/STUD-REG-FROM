import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { State, District, Block } from '../models/location.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Get all states
  getStates(): Observable<State[]> {
    return this.http.get<State[]>(`${this.apiUrl}/states`);
  }

  // Get districts by state ID
  getDistrictsByState(stateId: number): Observable<District[]> {
    return this.http.get<District[]>(`${this.apiUrl}/districts/${stateId}`);
  }

  // Get blocks by district ID
  getBlocksByDistrict(districtId: number): Observable<Block[]> {
    return this.http.get<Block[]>(`${this.apiUrl}/blocks/${districtId}`);
  }
}