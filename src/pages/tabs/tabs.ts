import { Component } from '@angular/core';

import { LeaderboardPage } from '../leaderboard/leaderboard/leaderboard';
import { ResultsPage } from '../matches/results/results';
// import { PlayersPage } from '../players/players';
import { ProfilePage } from '../player/profile/profile';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = LeaderboardPage;
  tab2Root: any = ResultsPage;
  tab3Root: any = ProfilePage;

  constructor() {

  }
}