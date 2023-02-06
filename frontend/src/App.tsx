import React from 'react';
import {
  BrowserRouter, Route, Switch, Redirect,
} from 'react-router-dom';
import About from './components/about';
import Home from './components/home';
import Civs from './components/civs';
import OpeningWins from './components/opening_wins';
import OpeningMatchups from './components/opening_matchups';
import Menu from './components/menu';
import Advanced from './components/advanced';

const App = () => (
  <BrowserRouter>
    <Menu />
    <div className="layout">
      <Switch>
        <Route
          render={() => <Redirect to="/home" />}
          path="/"
          exact
        />
        <Route path="/home" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/civ_stats" component={Civs} />
        <Route path="/opening_stats" component={OpeningWins} />
        <Route path="/opening_matchups" component={OpeningMatchups} />
        <Route path="/advanced" component={Advanced} />
      </Switch>
    </div>
  </BrowserRouter>
);

export default App;
