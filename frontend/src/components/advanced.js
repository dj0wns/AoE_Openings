import React, {Component} from 'react';
import Input from './input';
import DataTable from 'react-data-table-component';
import Multiselect from 'multiselect-react-dropdown';


class Advanced extends Component {
  constructor(props) {
    super(props);
    this.state = {
        info: {civs:[], ladders:[], maps:[], patches:[], openings:[], techs:[]},
        position: '',
        result:'',
        post_params: {
            min_elo:0,
            max_elo:3000,
            include_patch_ids:[],
            include_ladder_ids:[],
            include_map_ids:[],
            include_civ_ids_0:[],
            include_opening_ids_0:[],
            include_civ_ids_1:[],
            include_opening_ids_1:[],
            include_civ_ids_2:[],
            include_opening_ids_2:[],
            include_civ_ids_3:[],
            include_opening_ids_3:[],
            include_civ_ids_4:[],
            include_opening_ids_4:[],
            include_civ_ids_5:[],
            include_opening_ids_5:[]}
        };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }
  componentDidMount() {
    fetch('http://127.0.0.1:8000/api/v1/info/')
    .then(res => res.json())
    .then((data) => {
      data.techs.sort(function(a,b){return a-b});
      this.setState({ info: data });
    })
    .catch(console.log)
  }

  handleSubmit(event) {
    event.preventDefault();
    console.log(JSON.stringify(this.state.post_params))
    fetch('http://127.0.0.1:8000/api/v1/advanced/', {
      method: 'POST',
      headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state.post_params)
    }).then((response) => response.json())
      .then((json) => {
        console.log(json)
      })
  }
  onSelect(list, selectedList, selectedItem) {
    list.push(selectedItem.id)
  }
  onRemove(list, selectedList, removedItem) {
    list.splice(list.indexOf(removedItem.id),1)
  }
  handleChange(e) {
    const target = e.target;
    const name = target.name;
    const value = target.value;
    var new_post_params = this.state.post_params
    new_post_params[name] = value
    this.setState({
      post_params: new_post_params
    });
  }
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <div class="form-row">
          <div class="form-group col-md-6 mx-auto">
            <label for="min_elo">Min Elo</label>
            <input type="number"
                   class="form-control"
                   id="min_elo"
                   name="min_elo"
                   step="50"
                   min="0"
                   max="3000"
                   value={this.state.post_params.min_elo}
                   onChange={this.handleChange}/>
          </div>
          <div class="form-group col-md-6 mx-auto">
            <label for="max_elo">Max Elo</label>
            <input type="number"
                   class="form-control"
                   id="max_elo"
                   name="max_elo"
                   step="50"
                   min="0"
                   max="3000"
                   value={this.state.post_params.max_elo}
                   onChange={this.handleChange}/>
          </div>
        </div>
        <div class="form-row">
          <div class="form-check col-md-4" >
            <label for="include_patch_ids">Patches</label>
            <Multiselect name="include_patch_ids"
                         options={this.state.info.patches}
                         selectedValues={this.state.post_params.include_patch_ids}
                         onSelect={this.onSelect.bind(this, this.state.post_params.include_patch_ids)}
                         onRemove={this.onRemove.bind(this, this.state.post_params.include_patch_ids)}
                         displayValue='name'/>
          </div>
          <div class="form-check col-md-4" >
            <label for="include_ladder_ids">Ladders</label>
            <Multiselect name="include_ladder_ids"
                         options={this.state.info.ladders}
                         selectedValues={this.state.post_params.include_ladder_ids}
                         onSelect={this.onSelect.bind(this, this.state.post_params.include_ladder_ids)}
                         onRemove={this.onRemove.bind(this, this.state.post_params.include_ladder_ids)}
                         displayValue='name'/>
          </div>
          <div class="form-check col-md-4">
            <label for="include_map_ids">Maps</label>
            <Multiselect name="include_map_ids"
                         options={this.state.info.maps}
                         selectedValues={this.state.post_params.include_map_ids}
                         onSelect={this.onSelect.bind(this, this.state.post_params.include_map_ids)}
                         onRemove={this.onRemove.bind(this, this.state.post_params.include_map_ids)}
                         displayValue='name'/>
          </div>
        </div>
          {[...Array(3)].map((x,i) =>
          <div class="form-row justify-content-center">
             <div class="form-check col-md-2">
                <label for={"include_civ_ids_"+i*2}>Player {i*2} Civilations</label>
                <Multiselect name={"include_civ_ids_"+i*2}
                             options={this.state.info.civs}
                             selectedValues={this.state.post_params["include_civ_ids_"+i*2]}
                             onSelect={this.onSelect.bind(this, this.state.post_params["include_civ_ids_"+i*2])}
                             onRemove={this.onRemove.bind(this, this.state.post_params["include_civ_ids_"+i*2])}
                             displayValue='name'/>
             </div>
             <div class="form-check col-md-2">
                <label for={"include_opening_ids_"+i*2}>Player {i*2} Openings</label>
                <Multiselect name={"include_opening_ids_"+i*2}
                             options={this.state.info.openings}
                             selectedValues={this.state.post_params["include_opening_ids_"+i*2]}
                             onSelect={this.onSelect.bind(this, this.state.post_params["include_opening_ids_"+i*2])}
                             onRemove={this.onRemove.bind(this, this.state.post_params["include_opening_ids_"+i*2])}
                             displayValue='name'/>
             </div>
             <div class="col-md-2 align-self-center text-center">
                 <h5>vs</h5>
             </div>
             <div class="form-check col-md-2">
                <label for={"include_civ_ids_"+(i*2+1)}>Player {i*2+1} Civilations</label>
                <Multiselect name={"include_civ_ids_"+(i*2+1)}
                             options={this.state.info.civs}
                             selectedValues={this.state.post_params["include_civ_ids_"+(i*2+1)]}
                             onSelect={this.onSelect.bind(this, this.state.post_params["include_civ_ids_"+(i*2+1)])}
                             onRemove={this.onRemove.bind(this, this.state.post_params["include_civ_ids_"+(i*2+1)])}
                             displayValue='name'/>
             </div>
             <div class="form-check col-md-2">
                <label for={"include_opening_ids_"+(i*2+1)}>Player {i*2+1} Openings</label>
                <Multiselect name={"include_opening_ids_"+(i*2+1)}
                             options={this.state.info.openings}
                             selectedValues={this.state.post_params["include_opening_ids_"+(i*2+1)]}
                             onSelect={this.onSelect.bind(this, this.state.post_params["include_opening_ids_"+(i*2+1)])}
                             onRemove={this.onRemove.bind(this, this.state.post_params["include_opening_ids_"+(i*2+1)])}
                             displayValue='name'/>
             </div>

          </div>
          )}
        <div class="form-row justify-content-center align-self-center">
          <button class="btn btn-primary" type="submit">Submit</button>
        </div>
      </form>
    );
  }

}

export default Advanced
