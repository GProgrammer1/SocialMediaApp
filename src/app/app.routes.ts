import { Routes } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
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
  { path: 'suggested', component: SuggestedComponent}
];
