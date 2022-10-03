import React from 'react';

class Slider extends React.Component {
  constructor(props) {
    super(props);
    this.callback = this.props.callback;
    this.initial = props.initial;
    this.state = {
      sliderValue: this.initial,
    };
  }

  onChange = (e) => {
    console.log(e.target.value);
    this.callback(e.target.value);
    this.setState({ sliderValue: e.target.value });
  };

  render() {
    return (
      <>
        <span className="form-label range-label">{this.state.sliderValue}</span>
        <input className="form-control-range elo-slider" type="range" value={this.state.sliderValue} min="0" max="3000" step="25" onChange={this.onChange.bind(this)} />
      </>
    );
  }
}

export default Slider;
