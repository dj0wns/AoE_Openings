import React, {Component} from 'react';
import Civs from './components/civs'
import Menu from './components/menu'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

class App extends Component {
  state = {
    civilizations: []
  }
  componentDidMount() {
    fetch('http://127.0.0.1:8000/api/v1/civ_win_rates/')
    .then(res => res.json())
    .then((data) => {
      this.setState({ civilizations: data })
    })
    .catch(console.log)
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
            </Switch>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
