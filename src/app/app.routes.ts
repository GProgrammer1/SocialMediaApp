import { Routes } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

export const routes: Routes = [
    {path: '', component: MainPageComponent},
    {path: 'signup' , component: SignupComponent},
    {path: 'login', component: LoginComponent},
    {path: 'forgotpassword', component: ForgotPasswordComponent}
    
];
