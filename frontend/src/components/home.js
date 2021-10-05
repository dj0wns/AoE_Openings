import React, {Component, PropTypes } from 'react';
import queryString from 'query-string';
import DataTable from 'react-data-table-component';
import MetaSnapshotChart from './metaSnapshotChart.js';


class Home extends Component {
  render () {
    return (
      <div>
        <MetaSnapshotChart/>
      </div>
    )
  }
}

export default Home
