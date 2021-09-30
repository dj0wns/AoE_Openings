import React, {Component} from 'react';
import Civs from './components/civs'
import OpeningWins from './components/opening_wins'
import OpeningMatchups from './components/opening_matchups'
import Menu from './components/menu'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

class App extends Component {
  state = {
    civilizations: []
  }
  componentDidMount() {
  }
  render () {
    return (
      <div>
        <BrowserRouter>
          <Menu/>
          <div class="main-div">
            <Switch>
              <Route path="/civ_stats" component={Civs}/>
              <Route path="/opening_stats" component={OpeningWins}/>
              <Route path="/opening_matchups" component={OpeningMatchups}/>
            </Switch>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
