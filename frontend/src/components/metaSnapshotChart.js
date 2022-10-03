import React from 'react';
import Plot from 'react-plotly.js';

class MetaSnapshotChart extends React.Component {
  state = {
    graph_data: { meta_list: [] },
  };

  componentDidMount() {
    fetch('/api/v1/meta_snapshot/')
      .then((res) => res.json())
      .then((data) => {
        const opening_data = [];
        for (const opening of data.meta_list) {
          const opening_dict = {
            x: [], y: [], stackgroup: 'one', groupnorm: 'percent',
          };
          for (const [key, value] of Object.entries(opening)) {
            if (key == 'name') {
              opening_dict.name = value;
            } else {
              opening_dict.x.push(key);
              opening_dict.y.push(value);
            }
          }
          opening_data.push(opening_dict);
        }
        this.setState({ graph_data: { meta_list: opening_data, patch: data.patch } });
      })
      .catch(console.log);
  }

  render() {
    if (this.state.graph_data.meta_list.length > 0) {
      return (
        <Plot
          data={this.state.graph_data.meta_list}
          layout={{
            title: `Playrate of each Opening by Elo for Patch ${this.state.graph_data.patch} on Arabia`,
            responsive: true,
            xaxis: { title: '1v1 Elo' },
            yaxis: { title: 'Percentage' },
          }}
          useResizeHandler
          style={{ width: '%100', height: '%100' }}
        />
      );
    }
    return (<div />);
  }
}

export default MetaSnapshotChart;
