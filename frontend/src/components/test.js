import React, { Component } from "react";
import Plot from 'react-plotly.js';
import * as graph from "../assets/plotly_vars.json";
import * as figure from "../assets/plotly_vars.json";


class Plott extends Component{
 render(){
    return(
        <div>
            <Plot data={graph.data} layout={figure.layout} />
        </div>
    );
 }
}

export default Plott;
