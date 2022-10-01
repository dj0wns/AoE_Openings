import React, {Component} from 'react';
import Multiselect from 'multiselect-react-dropdown';
import {formatArgumentsForMultiSelect} from "./utils"

class Input extends Component {
  state = {
    info: {civs:[], ladders:[], maps:[], patches:[], openings:[]},
    min_elo_value: 0,
    max_elo_value: 3000,
    include_ladders: [],
    include_maps: [],
    include_patches: [],
    include_civs: [],
    exclude_civs: [],
    clamp_civs: [],
    include_openings: [],

  }
  constructor(props){
    super(props);
    this.callback = this.props.callback;
    this.exclude_mirror_default = this.props.defaultmirror
    this.include_openings = this.props.include_openings
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setInitialSelected = this.setInitialSelected.bind(this);
    this.min_elo_callback = this.min_elo_callback.bind(this);
    this.max_elo_callback = this.max_elo_callback.bind(this);
    this.handle_patches_add = this.handle_patches_add.bind(this);
    this.handle_patches_remove = this.handle_patches_remove.bind(this);
    this.handle_maps_add = this.handle_maps_add.bind(this);
    this.handle_maps_remove = this.handle_maps_remove.bind(this);
    this.handle_ladders_add = this.handle_ladders_add.bind(this);
    this.handle_ladders_remove = this.handle_ladders_remove.bind(this);
    this.handle_include_civs_add = this.handle_include_civs_add.bind(this);
    this.handle_include_civs_remove = this.handle_include_civs_remove.bind(this);
    this.handle_exclude_civs_add = this.handle_exclude_civs_add.bind(this);
    this.handle_exclude_civs_remove = this.handle_exclude_civs_remove.bind(this);
    this.handle_clamp_civs_add = this.handle_clamp_civs_add.bind(this);
    this.handle_clamp_civs_remove = this.handle_clamp_civs_remove.bind(this);
    this.handle_include_openings_add = this.handle_include_openings_add.bind(this);
    this.handle_include_openings_remove = this.handle_include_openings_remove.bind(this);
    this.handle_checkbox_change = this.handle_checkbox_change.bind(this);
    this.handle_change = this.handle_change.bind(this);
    this.search_params = new URLSearchParams(this.props.parent_query)
    this.initial_setup = false
  }

  setInitialSelected() {
    //Set Query params to form values, has to be done here or the drop downs arent populated
    var include_ladder_ids = [];
    if (this.search_params.get('include_ladder_ids')){
      include_ladder_ids = this.search_params.get('include_ladder_ids').split(",").map(Number);
      include_ladder_ids = formatArgumentsForMultiSelect(include_ladder_ids, this.state.info.ladders)
    }
    var include_map_ids = [];
    if (this.search_params.get('include_map_ids')){
      include_map_ids = this.search_params.get('include_map_ids').split(",").map(Number);
      include_map_ids = formatArgumentsForMultiSelect(include_map_ids, this.state.info.maps)
    }
    var include_patch_ids = [];
    if (this.search_params.get('include_patch_ids')){
      include_patch_ids = this.search_params.get('include_patch_ids').split(",").map(Number);
      include_patch_ids = formatArgumentsForMultiSelect(include_patch_ids, this.state.info.patches);
    } else {
      include_patch_ids = [this.state.info.patches[0]];
    }
    var include_civ_ids = []
    if (this.search_params.get('include_civ_ids')){
      include_civ_ids = this.search_params.get('include_civ_ids').split(",").map(Number);
      include_civ_ids = formatArgumentsForMultiSelect(include_civ_ids, this.state.info.civs)
    }
    var exclude_civ_ids = [];
    if (this.search_params.get('exclude_civ_ids')){
      exclude_civ_ids = this.search_params.get('exclude_civ_ids').split(",").map(Number);
      exclude_civ_ids = formatArgumentsForMultiSelect(exclude_civ_ids, this.state.info.civs)
    }
    var clamp_civ_ids = [];
    if (this.search_params.get('clamp_civ_ids')){
      clamp_civ_ids = this.search_params.get('clamp_civ_ids').split(",").map(Number);
      clamp_civ_ids = formatArgumentsForMultiSelect(clamp_civ_ids, this.state.info.civs)
    }
    var include_opening_ids = []
    if (this.search_params.get('include_opening_ids')){
      include_opening_ids = this.search_params.get('include_opening_ids').split(",").map(Number);
      include_opening_ids = formatArgumentsForMultiSelect(include_opening_ids, this.state.info.openings)
    }
    var min_elo_value = 0;
    if (this.search_params.get('min_elo') != null) {
      min_elo_value = this.search_params.get('min_elo')
    }
    var max_elo_value = 3000;
    if (this.search_params.get('max_elo') != null) {
      max_elo_value = this.search_params.get('max_elo')
    }

    this.setState({
        min_elo_value: min_elo_value,
        max_elo_value: max_elo_value,
        include_ladders: include_ladder_ids,
        include_maps: include_map_ids,
        include_patches: include_patch_ids,
        include_civs: include_civ_ids,
        exclude_civs: exclude_civ_ids,
        clamp_civs: clamp_civ_ids,
        include_openings: include_opening_ids,
    })
  }

  componentDidUpdate(nextProps, prevState) {
    // When component updates the first time, set initial values for input
    // Make sure info table has been loaded before loading in args because we need to use their names
    if (!this.initial_setup && this.state.info.maps.length) {
      this.initial_setup = true
      this.setInitialSelected()
    }
  }

  componentDidMount() {
    fetch('/api/v1/info/')
    .then(res => res.json())
    .then((data) => {
      this.setState({ info: data });
    })
    .catch(console.log)

  }
  handleSubmit(e) {
    e.preventDefault();
    var data_dict = {}
    //If unchanged from default dont add to query
    if (this.state.min_elo_value != 0 && this.state.min_elo_value != null) {
      data_dict["min_elo"] = this.state.min_elo_value;
    }

    if (this.state.max_elo_value != 3000 && this.state.max_elo_value != null) {
      data_dict["max_elo"] = this.state.max_elo_value;
    }
    if (this.state.include_ladders.length) {
      data_dict['include_ladder_ids'] = this.state.include_ladders.map( item => {return item.id});
    }
    if (this.state.include_maps.length) {
      data_dict['include_map_ids'] = this.state.include_maps.map( item => {return item.id});
    }
    if (this.state.include_patches.length) {
      data_dict['include_patch_ids'] = this.state.include_patches.map(item => {return item.id});
    }
    if (this.state.include_civs.length) {
      data_dict['include_civ_ids'] = this.state.include_civs.map(item => {return item.id});
    }
    if (this.state.exclude_civs.length) {
      data_dict['exclude_civ_ids'] = this.state.exclude_civs.map(item => {return item.id});
    }
    if (this.state.clamp_civs.length) {
      data_dict['clamp_civ_ids'] = this.state.clamp_civs.map(item => {return item.id});
    }
    if (this.state.include_openings.length) {
      data_dict['include_opening_ids'] = this.state.include_openings.map(item => {return item.id});
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
  // TODO: Find a way to get name from list so i can avoid this garbage
  handle_patches_add(selectedList, selectedItem) {
    let new_patches = this.state.include_patches.concat(selectedItem);
    this.setState({
      include_patches: new_patches
    });
  }
  handle_patches_remove(selectedList, selectedItem) {
    this.setState({
      include_patches: this.state.include_patches.filter(function(patch) {
        return patch !== selectedItem
      })
    });
  }
  handle_maps_add(selectedList, selectedItem) {
    let new_maps = this.state.include_maps.concat(selectedItem);
    this.setState({
      include_maps: new_maps
    });
  }
  handle_maps_remove(selectedList, selectedItem) {
    this.setState({
      include_maps: this.state.include_maps.filter(function(map) {
        return map !== selectedItem
      })
    });
  }
  handle_ladders_add(selectedList, selectedItem) {
    let new_ladders = this.state.include_ladders.concat(selectedItem);
    this.setState({
      include_ladders: new_ladders
    });
  }
  handle_ladders_remove(selectedList, selectedItem) {
    this.setState({
      include_ladders: this.state.include_ladders.filter(function(ladder) {
        return ladder !== selectedItem
      })
    });
  }
  handle_include_civs_add(selectedList, selectedItem) {
    let new_civs = this.state.include_civs.concat(selectedItem);
    this.setState({
      include_civs: new_civs
    });
  }
  handle_include_civs_remove(selectedList, selectedItem) {
    this.setState({
      include_civs: this.state.include_civs.filter(function(civ) {
        return civ !== selectedItem
      })
    });
  }
  handle_exclude_civs_add(selectedList, selectedItem) {
    let new_civs = this.state.exclude_civs.concat(selectedItem);
    this.setState({
      exclude_civs: new_civs
    });
  }
  handle_exclude_civs_remove(selectedList, selectedItem) {
    this.setState({
      exclude_civs: this.state.exclude_civs.filter(function(civ) {
        return civ !== selectedItem
      })
    });
  }
  handle_clamp_civs_add(selectedList, selectedItem) {
    let new_civs = this.state.clamp_civs.concat(selectedItem);
    this.setState({
      clamp_civs: new_civs
    });
  }
  handle_clamp_civs_remove(selectedList, selectedItem) {
    this.setState({
      clamp_civs: this.state.clamp_civs.filter(function(civ) {
        return civ !== selectedItem
      })
    });
  }
  handle_include_openings_add(selectedList, selectedItem) {
    let new_civs = this.state.include_openings.concat(selectedItem);
    this.setState({
      include_openings: new_civs
    });
  }
  handle_include_openings_remove(selectedList, selectedItem) {
    this.setState({
      include_openings: this.state.include_openings.filter(function(opening) {
        return opening !== selectedItem
      })
    });
  }
  render () {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <div class="form-row">
            <div class="form-group col-md-6 mx-auto">
              <label for="min_elo_value">Min Elo</label>
              <input type="number" class="form-control" id="min_elo_value" name="min_elo_value" step="50" min="0" max="3000" value={this.state.min_elo_value} onChange={this.handle_change}/>
            </div>
            <div class="form-group col-md-6 mx-auto">
              <label for="max_elo_value">Max Elo</label>
              <input type="number" class="form-control" id="max_elo_value" name="max_elo_value" step="50" min="0" max="3000" value={this.state.max_elo_value} onChange={this.handle_change}/>
            </div>
          </div>
          <div class="form-row">
            <div class="form-check col-md-4" >
              <label for="include_patches">Patches</label>
              <Multiselect name="include_patches"
                           options={this.state.info.patches}
                           selectedValues={this.state.include_patches}
                           displayValue='name'
                           onSelect={this.handle_patches_add}
                           onRemove={this.handle_patches_remove}/>
            </div>
            <div class="form-check col-md-4" >
              <label for="include_ladders">Ladders</label>
              <Multiselect name="include_ladders"
                           options={this.state.info.ladders}
                           selectedValues={this.state.include_ladders}
                           displayValue='name'
                           onSelect={this.handle_ladders_add}
                           onRemove={this.handle_ladders_remove}/>
            </div>
            <div class="form-check col-md-4">
              <label for="include_maps">Maps</label>
              <Multiselect name="include_maps"
                           options={this.state.info.maps}
                           selectedValues={this.state.include_maps}
                           displayValue='name'
                           onSelect={this.handle_maps_add}
                           onRemove={this.handle_maps_remove}/>
            </div>
          </div>
          { this.include_openings
            ?
            <div class="form-row">
              <div class="form-check col-md-6">
                <label for="include_openings">Include Openings</label>
                <Multiselect name="include_openings"
                             options={this.state.info.openings}
                             selectedValues={this.state.include_openings}
                             displayValue='name'
                             onSelect={this.handle_include_openings_add}
                             onRemove={this.handle_include_openings_remove}/>
              </div>
            </div>
            : <div/>
          }
          <div class="form-row">
            <button class="submit-button btn btn-primary" type="submit">Submit</button>
          </div>
        </form>
      </div>
    );
  }
}

export default Input
