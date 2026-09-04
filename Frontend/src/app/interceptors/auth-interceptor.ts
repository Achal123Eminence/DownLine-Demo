import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {

      // Token expired or invalid
      if (error.status === 401 && !req.url.includes('/auth/login')) {

        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');

        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
