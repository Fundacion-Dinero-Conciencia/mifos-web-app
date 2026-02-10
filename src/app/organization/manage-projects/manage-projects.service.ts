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

  getFilteredProjects(name: string, status: string[]): Observable<any> {
    const params = new HttpParams().set('name', name).set('statusName', status.join(','));
    return this.http.get('/investmentproject/search', { params });
  }
  getAllProject(name: string): Observable<any> {
    const params = new HttpParams().set('name', name);
    return this.http.get('/investmentproject/search', { params });
  }
  getProyectById(id: string | number): Observable<any> {
    const params = new HttpParams().set('id', id);
    return this.http.get('/investmentproject/search', { params });
  }
}
