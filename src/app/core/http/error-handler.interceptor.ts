/** Angular Imports */
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { Observable, from } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/** Environment Configuration */
import { environment } from 'environments/environment';

/** Custom Services */
import { AlertService } from '../alert/alert.service';
import { Logger } from '../logger/logger.service';

/** Initialize Logger */
const log = new Logger('ErrorHandlerInterceptor');

/**
 * Http Request interceptor to add a default error handler to requests.
 */
@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
  /**
   * @param {AlertService} alertService Alert Service.
   */
  constructor(private alertService: AlertService) {}

  /**
   * Intercepts a Http request and adds a default error handler.
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Error handler.
   */
  private handleError(response: HttpErrorResponse): Observable<HttpEvent<any>> {
    const status = response.status;
    let errorMessage = response.error?.developerMessage || response.message;

    if (response.error instanceof Blob) {
      return from(response.error.text()).pipe(
        map((errorText: string) => {
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage =
              errorJson?.errors?.[0]?.defaultUserMessage ||
              errorJson?.errors?.[0]?.developerMessage ||
              errorJson?.defaultUserMessage ||
              errorJson?.developerMessage ||
              response.message;
          } catch {
            errorMessage = errorText || response.message;
          }
          if (!environment.production) {
            log.error(`Request Error: ${errorMessage}`);
          }

          if (status === 401 || (environment.oauth.enabled && status === 400)) {
            this.alertService.alert({
              type: 'Authentication Error',
              message: 'Invalid User Details. Please try again!'
            });
          } else if (status === 403 && errorMessage === 'The provided one time token is invalid') {
            this.alertService.alert({ type: 'Invalid Token', message: 'Invalid Token. Please try again!' });
          } else if (status === 400) {
            this.alertService.alert({
              type: 'Bad Request',
              message: errorMessage || 'Invalid parameters were passed in the request!'
            });
          } else if (status === 403) {
            this.alertService.alert({
              type: 'Unauthorized Request',
              message: errorMessage || 'You are not authorized for this request!'
            });
          } else if (status === 404) {
            this.alertService.alert({
              type: 'Resource does not exist',
              message: errorMessage || 'Resource does not exist!'
            });
          } else if (status === 500) {
            this.alertService.alert({
              type: 'Internal Server Error',
              message: 'Internal Server Error. Please try again later.'
            });
          } else {
            this.alertService.alert({
              type: 'Unknown Error',
              message: 'Unknown Error. Please try again later.'
            });
          }
          throw response;
        })
      );
    }

    if (response.error.errors && response.error.errors[0]) {
      errorMessage = response.error.errors[0].defaultUserMessage || response.error.errors[0].developerMessage;
    }

    if (!environment.production) {
      log.error(`Request Error: ${errorMessage}`);
    }

    if (status === 401 || (environment.oauth.enabled && status === 400)) {
      this.alertService.alert({ type: 'Authentication Error', message: 'Invalid User Details. Please try again!' });
    } else if (status === 403 && errorMessage === 'The provided one time token is invalid') {
      this.alertService.alert({ type: 'Invalid Token', message: 'Invalid Token. Please try again!' });
    } else if (status === 400) {
      this.alertService.alert({
        type: 'Bad Request',
        message: errorMessage || 'Invalid parameters were passed in the request!'
      });
    } else if (status === 403) {
      this.alertService.alert({
        type: 'Unauthorized Request',
        message: errorMessage || 'You are not authorized for this request!'
      });
    } else if (status === 404) {
      this.alertService.alert({
        type: 'Resource does not exist',
        message: errorMessage || 'Resource does not exist!'
      });
    } else if (status === 500) {
      this.alertService.alert({
        type: 'Internal Server Error',
        message: 'Internal Server Error. Please try again later.'
      });
    } else {
      this.alertService.alert({
        type: 'Unknown Error',
        message: 'Unknown Error. Please try again later.'
      });
    }
    throw response;
  }
}
