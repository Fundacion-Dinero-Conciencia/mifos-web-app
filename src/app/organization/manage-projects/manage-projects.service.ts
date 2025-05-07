import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Project participations service.
 */
@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) {}

  getFilteredProjects(name: string): Observable<any> {
    return this.http.get('/investmentproject/search?name=' + name);
  }
}
