import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FaceDetectionModule } from 'ngx-face-detection';
import { environment } from 'src/environments/environment';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FaceDetectionModule.forRoot({
      script: 'human/human.js',
      // baseHref
      resourcesUrl: '/ngx-face-detection/',
      production: environment.production
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
