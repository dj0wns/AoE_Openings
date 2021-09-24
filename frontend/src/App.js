import React, {Component} from 'react';
import Civs from './components/civs'
import Menu from './components/menu'
import Test from './components/test'
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
              <Route path="/opening_stats" component={Civs}/>
              <Route path="/test" component={Test}/>
            </Switch>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
