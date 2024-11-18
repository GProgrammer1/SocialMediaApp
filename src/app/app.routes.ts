import { Routes } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ConfirmationPageComponent } from './confirmation-page/confirmation-page.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { CreatePostComponent } from './create-post/create-post.component';
import { ExploreComponent } from './explore/explore.component';
import { ChatComponent } from './chat/chat.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeStoryComponent } from './home-story/home-story.component';
import { HomePostComponent } from './home-post/home-post.component';
import { SuggestedComponent } from './suggested/suggested.component';
import { LikedComponent } from './liked/liked.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AppComponent } from './app.component';

export const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgotpassword', component: ForgotPasswordComponent },
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'create-post', component: CreatePostComponent },
  { path: 'explore', component: ExploreComponent },
  { path: 'chat', component: ChatComponent},
  { path: 'navbar', component: NavbarComponent},
  { path: 'home-story', component: HomeStoryComponent},
  { path: 'home-post', component: HomePostComponent},
  { path: 'suggested', component: SuggestedComponent},
  { path: 'liked', component: LikedComponent}
];
@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatToolbarModule,
    AppComponent,
    ProfileComponent,
    NavbarComponent,
    HomeStoryComponent,
    HomePostComponent,
    SuggestedComponent,
    LikedComponent
  ],
  providers: [],
  // bootstrap: [AppComponent]
})
export class AppModule { }
