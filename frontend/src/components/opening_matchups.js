import React, { Component } from 'react';
import DataTable from 'react-data-table-component';
import Input from './input';

class OpeningWins extends Component {
  state = {
    openings: [],
  };

  constructor(props) {
    super(props);
    this.input = React.createRef();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.query_params = this.props.location.search;
  }

  componentDidMount() {
    fetch('/api/v1/opening_matchups/'.concat(this.props.location.search))
      .then((res) => res.json())
      .then((data) => {
        data.openings_list = data.openings_list.filter((civ) => civ.total > 0);
        // Filter out openings with 0 matches
        this.setState({ openings: data });
      })
      .catch(console.log);
  }

  handleSubmit(data) {
    let query_string = '?';
    for (const [key, value] of Object.entries(data)) {
      query_string += key;
      query_string += '=';
      query_string += value;
      query_string += '&';
    }
    this.setState({ openings: [] });
    fetch('/api/v1/opening_matchups/'.concat(query_string))
      .then((res) => res.json())
      .then((data) => {
        data.openings_list = data.openings_list.filter((civ) => civ.total > 0);
        // Filter out openings with 0 matches
        this.setState({ openings: data });
      })
      .catch(console.log);
    // update page name
    this.props.history.push(`${window.location.pathname}${query_string}`);
  }

  render() {
    const columns = [
      {
        name: 'Name',
        selector: (row) => row.name,
        sortable: true,
      },
      {
        name: 'Win Rate',
        // if -1 just show 50%, else calculate the correct percent
        selector: (row) => -((row.wins == -1) ? 0.5 : row.wins / row.total),
        format: (row) => ((row.wins == -1) ? '50.00% (Mirror)' : `${(row.wins / row.total * 100).toFixed(2)}% (${row.wins})`),
        sortable: true,
      },
      {
        name: 'Play Rate',
        selector: (row) => -(row.total),
        format: (row) => `${(row.total / this.state.openings.total * 100).toFixed(2)}% (${row.total})`,
        sortable: true,
      },
    ];
    if (this.state.openings.hasOwnProperty('openings_list')) {
      return (
        <div>
          <Input defaultmirror={false} ref={this.input} callback={this.handleSubmit} parent_query={this.query_params} include_openings />
          <h3>
            {' '}
            Total Games in Query:
            {this.state.openings.total}
          </h3>
          <DataTable id="civTable" striped responsive data={this.state.openings.openings_list} columns={columns} cellspacing="0" width="80%" defaultSortFieldId={1} />
        </div>
      );
    }
    return (
      <div>
        <Input defaultmirror={false} ref={this.input} callback={this.handleSubmit} parent_query={this.query_params} include_openings />
        <center><h1>Loading Results...</h1></center>
      </div>
    );
  }
}

export default OpeningWins;
