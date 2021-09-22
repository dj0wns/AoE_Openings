import React, {Component} from 'react'
import queryString from 'query-string';
import Input from './input'


class Civs extends Component {
  state = {
    civilizations: []
  }
  constructor(props){
    super(props);
    this.input = React.createRef();
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentDidMount() {
     fetch('http://127.0.0.1:8000/api/v1/civ_win_rates/'.concat(this.props.location.search))
     .then(res => res.json())
     .then((data) => {
       this.setState({ civilizations: data })
     })
     .catch(console.log)
  }
  handleSubmit(data) {
    var query_string = "?";
    for (const [key, value] of Object.entries(data)) {
      query_string += key;
      query_string += '=';
      query_string += value;
      query_string += '&';
    }
    this.setState({ civilizations: [] })
    fetch('http://127.0.0.1:8000/api/v1/civ_win_rates/'.concat(query_string))
     .then(res => res.json())
     .then((data) => {
       this.setState({ civilizations: data })
     })
     .catch(console.log)
     // update page name
     this.props.history.push(`${window.location.pathname}` + query_string)
  }
  render () {
    if (this.state.civilizations.hasOwnProperty("civs_list")) {
      return (
        <div>
            <Input ref={this.input} callback={this.handleSubmit} parent_query={this.props.location.search}/>
            <h3> Total Games in Query: {this.state.civilizations.total}</h3>
            <table id="civTable" class="display table table-striped table-bordered table-sm" cellspacing="0" width="80%" data-toggle="table">
              <thead>
                <tr>
                  <th data-field="name" data-sortable="true" class="th-sm">Civilization</th>
                  <th data-field="win-rate" data-sortable="true" class="th-sm">Win Rate</th>
                  <th data-field="play-rate" data-sortable="true" class="th-sm">Play Rate</th>
                </tr>
              </thead>
              <tbody>
                {this.state.civilizations.civs_list.map((civ) => (
                  <tr>
                    <td>{civ.name}</td>
                    <td>{(civ.wins/(civ.total)*100).toFixed(2)+'%'}</td>
                    <td>{(civ.total/this.state.civilizations.total*100/2).toFixed(2)+'%'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      );
    }
    return (
      <div>
        <Input ref={this.input} callback={this.handleSubmit}/>
        <center><h1>Loading Results...</h1></center>
      </div>
    );
  }
}

export default Civs
