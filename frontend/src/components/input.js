import React, {Component} from 'react'
import Slider from './slider'

class Input extends Component {
  constructor(props){
    super(props);
    this.callback = this.props.callback;
    this.handleSubmit = this.handleSubmit.bind(this);
    this.min_elo_callback = this.min_elo_callback.bind(this);
    this.max_elo_callback = this.max_elo_callback.bind(this);
    this.handle_multiselect_change = this.handle_multiselect_change.bind(this);
    this.handle_checkbox_change = this.handle_checkbox_change.bind(this);
    this.handle_change = this.handle_change.bind(this);
  }

  componentDidMount() {
     fetch('http://127.0.0.1:8000/api/v1/info/')
     .then(res => res.json())
     .then((data) => {
       this.setState({ info: data })
     })
     .catch(console.log)
  }
  state = {
    info: {civs:[], ladders:[], maps:[]},
    min_elo_value: 0,
    max_elo_value: 3000,
    exclude_mirrors: true,
    include_ladders: [],
    include_maps: [],
    include_civs: [],
    exclude_civs: [],
    clamp_civs: [],

  }
  handleSubmit(e) {
    e.preventDefault();
    var data_dict = {}
    //If unchanged from default dont add to query
    if (this.state.min_elo_value != 0) {
      data_dict["min_elo"] = this.state.min_elo_value;
    }

    if (this.state.max_elo_value != 3000) {
      data_dict["max_elo"] = this.state.max_elo_value;
    }
    if (this.state.exclude_mirrors != true) {
      data_dict["exclude_mirrors"] = this.state.exclude_mirrors;
    }
    if (this.state.include_ladders.length) {
      data_dict['include_ladder_ids'] = this.state.include_ladders.toString();
    }
    if (this.state.include_maps.length) {
      data_dict['include_map_ids'] = this.state.include_maps.toString();
    }
    if (this.state.include_civs.length) {
      data_dict['include_civ_ids'] = this.state.include_civs.toString();
    }
    if (this.state.exclude_civs.length) {
      data_dict['exclude_civ_ids'] = this.state.exclude_civs.toString();
    }
    if (this.state.clamp_civs.length) {
      data_dict['clamp_civ_ids'] = this.state.clamp_civs.toString();
    }
    this.callback(data_dict);
  }
  min_elo_callback(value) {
    this.setState({min_elo_value:value});
  }
  max_elo_callback(value) {
    this.setState({max_elo_value:value});
  }
  handle_change(e) {
    const target = e.target;
    const name = target.name;
    const value = target.value;
    this.setState({
      [name]: value
    });
  }
  handle_checkbox_change(e) {
    const target = e.target;
    const name = target.name;
    const value = target.checked;
    this.setState({
      [name]: value
    });
  }
  handle_multiselect_change(e) {
    const target = e.target;
    const name = target.name;
    var value = [];
    for (var i = 0, l = target.options.length; i<l; i++) {
      if (target.options[i].selected) {
        value.push(target.options[i].value);
      }
    }
    this.setState({
      [name]: value
    });
  }
  render () {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <div class="form-row">
            <div class="form-group col-md-4 mx-auto">
              <label for="min_elo_value">Min Elo</label>
              <input type="number" class="form-control" id="min_elo_value" name="min_elo_value" step="25" min="0" max="3000" value={this.state.min_elo_value} onChange={this.handle_change}/>
            </div>
            <div class="form-group col-md-4 mx-auto">
              <label for="max_elo_value">Max Elo</label>
              <input type="number" class="form-control" id="max_elo_value" name="max_elo_value" step="25" min="0" max="3000" value={this.state.max_elo_value} onChange={this.handle_change}/>
            </div>
            <div class="form-group col-md-4 center-block my-auto civ-div">
              <input type="checkbox" class="form-check-input" name="exclude_mirrors" id="exclude_mirrors" checked={this.state.exclude_mirrors} onChange={this.handle_checkbox_change}/>
              <label class="form-check-label" for="exclude_mirrors">Exclude Civ Mirrors</label>
            </div>
          </div>
          <div class="form-row">
            <div class="form-check col-md-6" >
              <label for="include_ladders">Ladders</label>
              <select multiple name="include_ladders" id="include_ladders" class="form-control" onChange={this.handle_multiselect_change}>
                {Object.keys(this.state.info.ladders).map((ladder) => (
                  <option value={this.state.info.ladders[ladder]}>{ladder}</option>
                ))}
              </select>
            </div>
            <div class="form-check col-md-6">
              <label for="include_maps">Maps</label>
              <select multiple name="include_maps" id="include_maps" class="form-control" onChange={this.handle_multiselect_change}>
                {Object.keys(this.state.info.maps).map((map) => (
                  <option value={this.state.info.maps[map]}>{map}</option>
                ))}
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-check col-md-4">
              <label for="include_civs">Include Civilizations</label>
              <select multiple name="include_civs" id="include_civs" class="form-control" onChange={this.handle_multiselect_change}>
                {Object.keys(this.state.info.civs).map((civ) => (
                  <option value={this.state.info.civs[civ]}>{civ}</option>
                ))}
              </select>
            </div>
            <div class="form-check col-md-4">
              <label for="exclude_civs">Exclude Civilizations</label>
              <select multiple name="exclude_civs" id="exclude_civs" class="form-control" onChange={this.handle_multiselect_change}>
                {Object.keys(this.state.info.civs).map((civ) => (
                  <option value={this.state.info.civs[civ]}>{civ}</option>
                ))}
              </select>
            </div>
            <div class="form-check col-md-4">
              <label for="clamp_civs">Clamp Civilizations</label>
              <select multiple name="clamp_civs" id="clamp_civs" class="form-control" onChange={this.handle_multiselect_change}>
                {Object.keys(this.state.info.civs).map((civ) => (
                  <option value={this.state.info.civs[civ]}>{civ}</option>
                ))}
              </select>
            </div>
          </div>
          <button class="btn btn-primary" type="submit">Submit</button>
        </form>
      </div>
    );
  }
}

export default Input
