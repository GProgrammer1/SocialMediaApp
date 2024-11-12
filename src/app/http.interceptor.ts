import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from './auth.service';
import { catchError, switchMap } from 'rxjs';
export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  
  const token = sessionStorage.getItem('authToken');
  const authService = inject(AuthService);
  
  if (token) {

    const decodedToken = jwtDecode(token);
    const expirationTime = decodedToken.exp;

    if (expirationTime && expirationTime * 1000 < Date.now()) {
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');

      return authService.refreshToken().pipe(
        switchMap((response: any) => {
          sessionStorage.setItem('authToken', response.token);
          sessionStorage.setItem('user', JSON.stringify(response.user));
          return next(req);
        }),
        catchError((error: any) => {
          console.error('Error:', error);
          return next(req);
        })
      );
      
    }
    else {
      const newreq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next(newreq);
    }
  }
  else {
    return next(req);
  }

};
