import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, App } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { TabsPage } from '../tabs/tabs';
import { MyApp } from '../../app/app.component';
import firebase from 'firebase';
// import { AuthProviders, AuthMethods, AngularFire } from 'angularfire2';

/*
  Generated class for the Login page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  signupData = {
    email: '',
    password: '',
    passwordRetyped: ''
  };
  private registered: boolean = false;
  private title: string = "Login";

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private afAuth: AngularFireAuth,
    private toastCtrl: ToastController,
    private app: App,
  ) {
    this.registered = this.navParams.get('isLogin');
  }

  ngOnInit() {
    if (this.registered) {
      this.switchToLogin();
    } else {
      this.switchToRegister();
    }
  }

  submit() {
    if (this.registered) {
      this.register();
    } else if (!this.registered) {
      this.login();
    }
  }

  login() {
    this.afAuth.auth.signInWithEmailAndPassword(this.signupData.email, this.signupData.password)
      .then((response) => {
        this.presentToast('Successfully logged in');
        // console.log(response);
        setTimeout(() => {
          const root = this.app.getRootNav();
          root.setRoot(MyApp);
        }, 100);

    }).catch((error) => {
      this.presentToast(error.message);
    })
  }

  register() {
    if (this.signupData.password !== this.signupData.passwordRetyped) {
      this.presentToast("Your password and re-entered password do not match.")
    } else {
      let credential = firebase.auth.EmailAuthProvider.credential(this.signupData.email, this.signupData.password)
      this.afAuth.auth.currentUser.linkWithCredential(credential)
      .then(auth => {
        // Could do something with the Auth-Response
        this.presentToast('Successfully registered');
        setTimeout(() => {
          const root = this.app.getRootNav();
          root.setRoot(MyApp);
        }, 100);
      })
      .catch(err => {
        this.presentToast(err.message.toString());
      })
    }
  }

  switchToRegister() {
    this.registered = true;
    this.title = "Register";
  }

  switchToLogin() {
    this.registered = false;
    this.title = "Login";
  }

  presentToast(text:string) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });

    toast.onDidDismiss(() => {
    });

    toast.present();
  }
}
