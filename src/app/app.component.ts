import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';

import { UsernamePage } from "../pages/username/username";
import { SelectCompetitionPage } from "../pages/competition/select-competition/select-competition";
import { ApiService } from '../providers/api-service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;

  constructor(platform: Platform, 
              private afModule: AngularFireModule,
              private afAuth: AngularFireAuth, 
              private apiService: ApiService,
              private splashScreen: SplashScreen,
              private statusBar: StatusBar
            ) {
    this.afAuth.authState.subscribe(auth => {
      // console.log(auth);
      if (!auth) {
        this.rootPage = UsernamePage;
      } else {
        this.apiService.player.uid = auth.uid;
        this.rootPage = SelectCompetitionPage;
      }
    })

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      // window.fabric.Crashlytics.addLog("about to send a crash for testing!");
      // window.fabric.Crashlytics.sendCrash();
      
    });
  }
}