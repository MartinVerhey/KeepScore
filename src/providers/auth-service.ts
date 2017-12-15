import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth, AngularFireAuthProvider } from 'angularfire2/auth';
// import { FirebaseAuthState, AuthProviders, AuthMethods, AngularFire } from 'angularfire2';
import { ApiService } from './api-service';
import { Subscription } from 'rxjs/Subscription';
import { User } from 'firebase';

/*
  Generated class for the AuthService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AuthService {

  public authState: User = null;
  public playerData: any;
  private authSub: Subscription;

  constructor(
    private afDB: AngularFireDatabase,
    private afAuth: AngularFireAuth,
    private toastCtrl: ToastController,
    private apiService: ApiService
  ) { }

  ngOnInit() {
    this.authSub = this.afAuth.authState.subscribe((auth) => {
      this.authState = auth;
    });
  }

  ngOnDestroy() {
    console.log("AuthService Destroyed")
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  anonymousLogin(username) {
    return this.afAuth.auth.signInAnonymously().then((response) => {
      console.log("Successful login:")
      console.log(response);

      this.apiService.saveUser(response.uid, username).then((response) => {
        console.log("Succesfully saved");
      });
    })
      .catch(error => this.presentToast(error.message));
  }

  get authenticated(): boolean {
    return this.authState !== null;
  }

  get currentUserId(): string {
    return this.authenticated ? this.authState.uid : '';
  }

  get currentUserAnonymous(): boolean {
    return this.authenticated ? this.authState.isAnonymous : false;
  }

  presentToast(text: string) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'middle'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }

}