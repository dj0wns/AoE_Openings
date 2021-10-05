import React from 'react';
import Plot from 'react-plotly.js';

class MetaSnapshotChart extends React.Component {
  state = {
    graph_data: []
  }
  componentDidMount() {
    fetch('/api/v1/meta_snapshot/')
     .then(res => res.json())
     .then((data) => {
       var opening_data = [];
       for (let opening of data) {
         let opening_dict = { x:[], y:[], stackgroup: 'one', groupnorm:'percent'}
         for (let [key, value] of Object.entries(opening)) {
           if (key == "name") {
             opening_dict['name'] = value;
           } else {
             opening_dict.x.push(key)
             opening_dict.y.push(value)
           }
         }
         opening_data.push(opening_dict);
       }
       this.setState({ graph_data:opening_data})
     })
     .catch(console.log)
  }

  render() {
    if (this.state.graph_data.length > 0) {
      return (
        <Plot
          data={this.state.graph_data}
          layout={ {title: 'Opening Playrate by Elo', responsive: true} }
          useResizeHandler= {true}
          style={{width:'%100', height: '%100'}}
        />
      );
    } else {
      return ( <div/>);

    }
  }
}

export default MetaSnapshotChart
