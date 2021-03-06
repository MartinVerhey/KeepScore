import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import firebase from 'firebase';
import { Observable } from 'rxjs/Observable';
import { IPlayer } from '../models/player.models';
import { ICompetition } from '../models/competition.models';
import { IRankHistory } from '../models/rank-history.models';
import 'rxjs/add/operator/do';
import * as Firebase from 'firebase';

@Injectable()
export class ApiService {
  player: IPlayer;
  currentCompetition: ICompetition;

  constructor(
    private afDB: AngularFireDatabase
  ) {
    this.player = {
      uid: '',
      username: '',
      competition_selected: '',
    }
   }

  getCurrentPlayer(authID): Observable<IPlayer> {
    return this.afDB.object('/users/' + authID)
      .snapshotChanges()
      .map(player => {
        return {
          uid: player.key, ...player.payload.val()
        };
      })
      .map(res => res as IPlayer)
      .do(res => this.player = res);
  }

  getPlayerInComp(): Observable<any[]> {
    return this.afDB.list('/rank/' + this.player.competition_selected + '/' + this.uid, ref => ref.limitToLast(1)).valueChanges();
  }

  set currentPlayer(player) {
    this.player = player;
  }

  get uid(): string {
    return this.player.uid;
  }

  get username(): string {
    return this.player.usernames[this.player.competition_selected];
  }

  get competitionSelected(): string {
    return this.player.competition_selected;
  }
   
  getCompetitions(): Observable<ICompetition[]> {
    return this.afDB.list('/competition', ref => ref.limitToLast(50))
    .snapshotChanges()
    .map(actions => {
      return actions.map(action => ({
        key: action.key, ...action.payload.val()
      }));
    });
  }
  
  getCompetitionsForCurrentUser() {
    return this.afDB.list('/users/' + this.player.uid + '/competitions/', ref => ref.limitToLast(30))
    .snapshotChanges()
    .map(competitions => {
      return competitions.map(competition => ({
        name: competition.payload.val(),
        key: competition.key,
      }));
    });
  }

  getUsernamesForCurrentUser() {
    return this.afDB.list('/users/' + this.player.uid + '/usernames/', ref => ref.limitToLast(30))
    .snapshotChanges()
    .map(usernames => {
      return usernames.map(username => ({
        username: username.payload.val(),
        key: username.key,
      }));
    });
  }
  
  getMatches() {
    return this.afDB.list('/matches/' + this.player.competition_selected, ref => ref.limitToLast(50))
    .snapshotChanges()
    .map(matches => {
      return matches.map(match => ({
        key: match.key, ...match.payload.val()
      }));
    });
  }

  getRankHistory(uid): Observable<IRankHistory[]> {
    return this.afDB.list('/ranking/' + uid + '/' + this.player.competition_selected, ref => ref.limitToLast(7))
      .valueChanges()
      .map(res => res as IRankHistory[]);
  }

  getMatchHistory(matchid, uid): Observable<IRankHistory> {
    return this.afDB.object('/ranking/' + uid + '/' + this.player.competition_selected + '/' + matchid)
      .valueChanges()
      .map(res => res as IRankHistory);
  }
  
  getPlayersInCompetition() {
    return this.afDB.list('/rank/' + this.player.competition_selected)
    .snapshotChanges()
    .map(actions => {
      return actions.map(action => ({
        key: action.key, ...action.payload.val()
      }));
    });
  }

  getUsers() {
    return this.afDB.list('/users', ref => ref.limitToLast(50)).valueChanges();
  }
    
  getUser(uid): Observable<IPlayer> {
    return this.afDB.object('/users/' + uid)
      .snapshotChanges()
      .map(user => {
        return {
          uid: user.key, ...user.payload.val()
        };
      })
      .map(res => res as IPlayer);
  }

  getCompetition(key) {
    return this.afDB.object('/competition/' + key).valueChanges().map(res => res as ICompetition);
  }

  saveMatch(competition) {
    return this.afDB.list('/matches/' + this.player.competition_selected).push(competition);
  }

  removeMatch(match) {
    return this.afDB.list('/matches/' + this.player.competition_selected).remove(match);
  }

  saveUser(uid) {
    return this.afDB.list('/users').update(uid, {
      "created_at": Firebase.database.ServerValue.TIMESTAMP
    })
  }

  saveDummy(dummyUID, uid, currentPlayerUsername) {
    return this.afDB.list('/users').update(dummyUID, {
      "created_at": Firebase.database.ServerValue.TIMESTAMP,
      "owner": {
        "id": uid,
        "username": currentPlayerUsername
      }
    })
  }

  createDummy(botUID) {
    return this.afDB.list('/users').update(botUID, {
      "dummy": true,
    })
  }

  saveCompetition(name, uid) {
    return this.afDB.list('/competition/').push({
      "name": name,
      "admin": uid,
      "users": {
        [uid]: true
      }
    })
  }

  addPlayerToCompetition(key, competitionName) {
    this.player.competition_selected = key;
    firebase.database().ref('users/' + this.player.uid + '/usernames/' + key).set(this.player.username);
    firebase.database().ref('users/' + this.player.uid + '/username').set(this.player.username);
    firebase.database().ref('users/' + this.player.uid + '/competition_selected').set(key);
    firebase.database().ref('users/' + this.player.uid + '/competitions/' + key).set(competitionName);
    firebase.database().ref('rank/' + key + '/' + this.player.uid + '/').update({username: this.player.username});
    return firebase.database().ref('competition/' + key + '/users/' + this.player.uid).set(this.player.username);
  }

  addDummyToCompetition(username, dummyUID, key, competitionName) {
    firebase.database().ref('users/' + dummyUID + '/usernames/' + key).set(username);
    firebase.database().ref('users/' + dummyUID + '/username').set(username);
    firebase.database().ref('users/' + dummyUID + '/competition_selected').set(key);
    firebase.database().ref('users/' + dummyUID + '/competitions/' + key).set(competitionName);
    firebase.database().ref('rank/' + key + '/' + dummyUID + '/username').set(username);
    return firebase.database().ref('competition/' + key + '/users/' + dummyUID).set(username);
  }

  removePlayerFromCompetition(key, uid) {
    firebase.database().ref('rank/' + key + '/' + uid + '/username/').set('');
    return firebase.database().ref('rank/' + key + '/' + uid + '/username/').remove();
  }

  switchCompetition(key) {
    firebase.database().ref('users/' + this.player.uid + '/competition_selected').set(key);
    this.player.competition_selected = key;
    this.switchCurrentUsername();
  }

  switchCurrentUsername() {
    this.getPlayerInComp().take(1).subscribe(player => {
      let username =  player[0];
      this.player.username = username;
      firebase.database().ref('users/' + this.player.uid + '/username').set(username);
    })
  }


}
