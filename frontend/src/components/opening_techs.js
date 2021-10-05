import React, {Component, PropTypes } from 'react';
import queryString from 'query-string';
import Input from './input';
import DataTable from 'react-data-table-component';
import {format_game_time} from './utils';


class OpeningTechs extends Component {
  state = {
    openings: {}
  }
  constructor(props){
    super(props);
    this.input = React.createRef();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.query_params = this.props.location.search;
  }
  componentDidMount() {
    fetch('http://127.0.0.1:8000/api/v1/opening_techs/'.concat(this.props.location.search))
     .then(res => res.json())
     .then((data) => {
       // Filter out openings with 0 matches
       this.setState({ openings: data})
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
    this.setState({ openings: [] })
    fetch('http://127.0.0.1:8000/api/v1/opening_techs/'.concat(query_string))
      .then(res => res.json())
      .then((data) => {
        // Filter out openings with 0 matches
        this.setState({ openings: data})
      })
      .catch(console.log)
     // update page name
     this.props.history.push(`${window.location.pathname}` + query_string)
  }
  render () {
    var columns = [
        {
          name: "Name",
          selector: row => row.name,
          sortable: true,
        },
    ]
    if (this.state.openings.hasOwnProperty("openings_list")) {
      // pull necessary columns from first element of list
      for (const [key, value] of Object.entries(this.state.openings.openings_list[0])) {
        console.log(key)
        if (key == 'name') continue;
        columns.push(
          {
            name: key,
            selector: row => row[key],
            format: row => format_game_time(row[key]),
            sortable: true
          }
        );
      }
    }
    console.log(this.state.openings)
    return (
      <div>
          <Input defaultmirror={false} ref={this.input} callback={this.handleSubmit} parent_query={this.query_params} include_techs={true}/>
          <h3> Total Games in Query: {this.state.openings.total}</h3>
          <DataTable id="civTable" striped responsive data={this.state.openings.openings_list} columns={columns} cellspacing="0" width="80%" defaultSortFieldId={1}/>
      </div>
    );
  }
}

export default OpeningTechs
