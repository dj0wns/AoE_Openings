import React, {Component} from 'react';
import About from './components/about'
import Home from './components/home'
import Civs from './components/civs'
import OpeningWins from './components/opening_wins'
import OpeningMatchups from './components/opening_matchups'
import Menu from './components/menu'
import Advanced from './components/advanced'
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
              <Route exact path="/" render={() => {
                      return (
                        <Redirect to="/home"/>
                      )
                  }}
              />
              <Route path="/about" component={About}/>
              <Route path="/home" component={Home}/>
              <Route path="/civ_stats" component={Civs}/>
              <Route path="/opening_stats" component={OpeningWins}/>
              <Route path="/opening_matchups" component={OpeningMatchups}/>
              <Route path="/advanced" component={Advanced}/>
            </Switch>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
