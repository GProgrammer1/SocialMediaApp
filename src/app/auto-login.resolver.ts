import { ResolveFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { catchError, of, switchMap } from 'rxjs';
import { SocketService } from './socket.service';

export const autoLoginResolver: ResolveFn<boolean> = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const socketService = inject(SocketService);
  


  return authService.refreshToken().pipe(
    switchMap((response: any) => {
      sessionStorage.setItem('authToken', response.authToken);
      
      sessionStorage.setItem('user', JSON.stringify(response.user));
      router.navigate(['/home']);
      socketService.connect();
      return of(true);
      
    }),
    catchError((error: any) => {
      console.log(error);
      
      console.error('Error:', error.error);
      return of(false);
      
    })
  );
};
