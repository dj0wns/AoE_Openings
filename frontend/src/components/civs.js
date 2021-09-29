import React, {Component, PropTypes } from 'react';
import queryString from 'query-string';
import Input from './input';
import DataTable from 'react-data-table-component';


class Civs extends Component {
  state = {
    civilizations: []
  }
  constructor(props){
    super(props);
    this.input = React.createRef();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.query_params = this.props.location.search;
  }
  componentDidMount() {
    fetch('http://127.0.0.1:8000/api/v1/civ_win_rates/'.concat(this.props.location.search))
     .then(res => res.json())
     .then((data) => {
       data.civs_list = data.civs_list.filter(function(civ) {return civ.total > 0})
       // Filter out civs with 0 matches
       this.setState({ civilizations: data})
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
        data.civs_list = data.civs_list.filter(function(civ) {return civ.total > 0})
        // Filter out civs with 0 matches
        this.setState({ civilizations: data})
      })
      .catch(console.log)
     // update page name
     this.props.history.push(`${window.location.pathname}` + query_string)
  }
  render () {
    const columns = [
        {
          name: "Name",
          selector: row => row.name,
          sortable: true,
        },
        {
          name: "Win Rate",
          selector: row => (row.wins / row.total * 100).toFixed(2)+'%',
          sortable: true,
        },
        {
          name: "Play Rate",
          selector: row => (row.total/this.state.civilizations.total*100/2).toFixed(2)+'%',
          sortable: true,
        }
    ]
    if (this.state.civilizations.hasOwnProperty("civs_list")) {
      return (
        <div>
            <Input ref={this.input} callback={this.handleSubmit} parent_query={this.query_params}/>
            <h3> Total Games in Query: {this.state.civilizations.total}</h3>
            <DataTable id="civTable" striped responsive data={this.state.civilizations.civs_list} columns={columns} cellspacing="0" width="80%"/>
        </div>
      );
    }
    return (
      <div>
        <Input ref={this.input} callback={this.handleSubmit} parent_query={this.query_params}/>
        <center><h1>Loading Results...</h1></center>
      </div>
    );
  }
}

export default Civs
