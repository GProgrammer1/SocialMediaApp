import { ResolveFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { catchError, of, switchMap } from 'rxjs';

export const autoLoginResolver: ResolveFn<boolean> = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.refreshToken().pipe(
    switchMap((response: any) => {
      sessionStorage.setItem('authToken', response.authToken);
      sessionStorage.setItem('user', JSON.stringify(response.user));
      router.navigate(['/home']);
      return of(true);
      
    }),
    catchError((error: any) => {
      console.error('Error:', error.error);
      return of(false);
      
    })
  );
};
