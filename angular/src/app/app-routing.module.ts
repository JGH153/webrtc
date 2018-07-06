import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthenticatedGuard }  from './authentication.guard';

import { LoginComponent } from './login/login.component';
import { VideoClientComponent } from './video-client/video-client.component';
import { ImageManipulationComponent } from './image-manipulation/image-manipulation.component';
import { DrawingComponent } from './drawing/drawing.component';

//TODO add router guard for video if not logged inn
const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
	},
	{
        path: 'drawing',
        component: DrawingComponent
    },
    {
        path: 'image',
        component: ImageManipulationComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'video',
        component: VideoClientComponent,
        canActivate: [AuthenticatedGuard]
    },
    {
        path: '**',
        redirectTo: '/login'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
