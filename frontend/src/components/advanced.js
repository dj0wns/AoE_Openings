import React, {Component} from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Input from './input';
import DataTable from 'react-data-table-component';
import Multiselect from 'multiselect-react-dropdown';
import {cartesian} from "./utils";

const ADVANCED_QUERY_COUNT = 50;

class Advanced extends Component {
  constructor(props) {
    super(props);
    this.state = {
        info: {civs:[], ladders:[], maps:[], patches:[], openings:[], techs:[]},
        position: -2,
        // Position:
        // -3 Error: too many combinations selected - total selected / max selected
        // -2 means nothing
        // -1 means data or response received from server
        // 0 means data is currently being processed
        // 1 means there is one person in front of you in line
        // etc.
        result:'',
        data: {},
        row_count: 3,
        tab_index: 0,
        // tab_index: index for input type tabs:
        // 0 Free Entry
        // 1 Combinatorics
        post_params: {
            min_elo:0,
            max_elo:3000,
            include_patch_ids:[],
            include_ladder_ids:[],
            include_map_ids:[],
            include_left_civ_combinations:[],
            include_left_opening_combinations:[],
            include_right_civ_combinations:[],
            include_right_opening_combinations:[],
            }
        };

    // Add dynamic rows to post params
    // we allow up to 50 rows, so do 100 of these
    for (var i=0; i < ADVANCED_QUERY_COUNT*2; ++i) {
      this.state.post_params["include_civ_ids_" + i] = []
      this.state.post_params["include_opening_ids_" + i] = []
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleTabs = this.handleTabs.bind(this);
    this.handleRowChange = this.handleRowChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.query_params = this.props.location.search;
    this.onSelect = this.onSelect.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }
  componentDidMount() {
    fetch('/api/v1/info/')
    .then(res => res.json())
    .then((data) => {
      data.techs.sort(function(a,b){return a-b});
      this.setState({ info: data });
    })
    .catch(console.log)
    if (this.query_params) {
      fetch('/api/v1/advanced/' + this.query_params, {
            method: 'GET',
      }).then((response) => response.json())
        .then((data) => {
        // Invalid string if no result
        if (data.result) {
          this.setState({data:data.result})
          this.setState({ position: -1});
        }
      })
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    var post_params = {};
    if (this.state.tab_index == 0) {
      post_params = this.state.post_params;
    } else if (this.state.tab_index == 1) {
      // generate post params from combinations
      post_params.min_elo = this.state.post_params.min_elo;
      post_params.max_elo = this.state.post_params.max_elo;
      post_params.include_patch_ids = this.state.post_params.include_patch_ids;
      post_params.include_ladder_ids = this.state.post_params.include_ladder_ids;
      post_params.include_map_ids = this.state.post_params.include_map_ids;
      post_params.include_left_civ_combinations = this.state.post_params.include_left_civ_combinations;
      post_params.include_left_opening_combinations = this.state.post_params.include_left_opening_combinations;
      post_params.include_right_civ_combinations = this.state.post_params.include_right_civ_combinations;
      post_params.include_right_opening_combinations = this.state.post_params.include_right_opening_combinations;
      // add a -1 to empty lists
      if (!post_params.include_left_civ_combinations.length) {
        post_params.include_left_civ_combinations = [-1]
      }
      if (!post_params.include_left_opening_combinations.length) {
        post_params.include_left_opening_combinations = [-1]
      }
      if (!post_params.include_right_civ_combinations.length) {
        post_params.include_right_civ_combinations = [-1]
      }
      if (!post_params.include_right_opening_combinations.length) {
        post_params.include_right_opening_combinations = [-1]
      }
      // Verify that the combinations aren't too large:
      if (post_params.include_left_civ_combinations.length *
          post_params.include_left_opening_combinations.length *
          post_params.include_right_civ_combinations.length *
          post_params.include_right_opening_combinations.length > ADVANCED_QUERY_COUNT) {
        this.setState({ position: -3});
        return;
      }
      var i = 0;
      for (let combo of cartesian(post_params.include_left_civ_combinations,
                post_params.include_left_opening_combinations,
                post_params.include_right_civ_combinations,
                post_params.include_right_opening_combinations)) {
        //replace -1 with empty string again
        if (combo[0] != -1) {
          post_params["include_civ_ids_" + (2*i)] = [combo[0]]
        } else {
          post_params["include_civ_ids_" + (2*i)] = []
        }
        if (combo[1] != -1) {
          post_params["include_opening_ids_" + (2*i)] = [combo[1]]
        } else {
          post_params["include_opening_ids_" + (2*i)] = []
        }
        if (combo[2] != -1) {
          post_params["include_civ_ids_" + (2*i + 1)] = [combo[2]]
        } else {
          post_params["include_civ_ids_" + (2*i + 1)] = []
        }
        if (combo[3] != -1) {
          post_params["include_opening_ids_" + (2*i + 1)] = [combo[3]]
        } else {
          post_params["include_opening_ids_" + (2*i + 1)] = []
        }
        i++;
      }

    }
    //Update page name
    this.props.history.push(`${window.location.pathname}`)
    fetch('/api/v1/advanced/', {
      method: 'POST',
      headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(post_params)
    }).then((response) => response.json())
      .then((json) => {
        if (json.result != "") {
          // We have a valid result, update the page and fetch the data
          fetch('/api/v1/advanced/?id='+json.result, {
            method: 'GET',
          }).then((response) => response.json())
            .then((data) => {
            //Update page name
            this.props.history.push(`${window.location.pathname}` + "?id=" + json.result)

            this.setState({data:data.result})
            this.setState({ position: -1});
          })
        } else {
          // We are waiting in queue for a response
          this.setState({ position: json.position});
          this.setState({data:{}})
          // Try again after 500 ms
          setTimeout(this.handleSubmit.bind(this, event), 1000);
        }

      })
      .catch((error) => {
        console.log(error)
      })

  }
  onSelect(list, selectedList, selectedItem) {
    list.push(selectedItem.id)
  }
  onRemove(list, selectedList, removedItem) {
    list.splice(list.indexOf(removedItem.id),1)
  }
  handleRowChange(e) {
    const target = e.target;
    const name = target.name;
    const value = target.value;
    var new_post_params = this.state.post_params
    // Clear post params so data isnt double saved
    for (var i=target.value; i < ADVANCED_QUERY_COUNT*2; ++i) {
      new_post_params["include_civ_ids_" + i] = []
      new_post_params["include_opening_ids_" + i] = []
    }
    this.setState({
      row_count: parseInt(value),
      post_params: new_post_params
    });
  }
  handleChange(e) {
    const target = e.target;
    const name = target.name;
    const value = target.value;
    var new_post_params = this.state.post_params
    new_post_params[name] = parseInt(value)
    this.setState({
      post_params: new_post_params
    });
  }
  handleTabs(index) {
    this.setState({
      tab_index: index
    });
  }
  render() {
    const columns = [
        {
          name: "Name",
          selector: row => row.name,
          sortable: true,
        },
        {
          name: "Win Rate",
          // if -1 just show 50%, else calculate the correct percent
          selector: row => (row.wins == -1) ? 0.5 : row.wins / row.total,
          format: row => (row.wins == -1) ? '50.00% (Mirror)' : (row.wins / row.total * 100).toFixed(2)+'% (' + row.wins + ')',
          sortable: true,
        },
        {
          name: "Total Games",
          selector: row => row.total,
          format: row => row.total,
          sortable: true,
        }
    ]
    return (
      <div>
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
          <div class="form-check col-md-2" >
            <label for="include_ladder_ids">Ladders</label>
            <Multiselect name="include_ladder_ids"
                         options={this.state.info.ladders}
                         selectedValues={this.state.post_params.include_ladder_ids}
                         onSelect={this.onSelect.bind(this, this.state.post_params.include_ladder_ids)}
                         onRemove={this.onRemove.bind(this, this.state.post_params.include_ladder_ids)}
                         displayValue='name'/>
          </div>
          <div class="form-check col-md-4" >
            <label for="include_patch_ids">Patches</label>
            <Multiselect name="include_patch_ids"
                         options={this.state.info.patches}
                         selectedValues={this.state.post_params.include_patch_ids}
                         onSelect={this.onSelect.bind(this, this.state.post_params.include_patch_ids)}
                         onRemove={this.onRemove.bind(this, this.state.post_params.include_patch_ids)}
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
          <div class="form-group col-md-2 mx-auto">
            <label for="num_rows">Row Count</label>
            <input type="number"
                   class="form-control"
                   id="num_rows"
                   name="num_rows"
                   step="1"
                   min="0"
                   max={ADVANCED_QUERY_COUNT}
                   value={this.state.row_count}
                   onChange={this.handleRowChange}/>
          </div>
        </div>
        <Tabs onSelect={this.handleTabs}>
          <TabList>
            <Tab>Free Entry</Tab>
            <Tab>Combinations</Tab>
          </TabList>
          <TabPanel>
            {[...Array(this.state.row_count)].map((x,i) =>
            <div class="form-row justify-content-center">
               <div class="form-check col-md-2">
                  <label for={"include_civ_ids_"+i*2}>Row {i} Civ</label>
                  <Multiselect name={"include_civ_ids_"+i*2}
                               options={this.state.info.civs}
                               selectionLimit='1'
                               onSelect={this.onSelect.bind(this, this.state.post_params["include_civ_ids_"+i*2])}
                               onRemove={this.onRemove.bind(this, this.state.post_params["include_civ_ids_"+i*2])}
                               displayValue='name'/>
               </div>
               <div class="form-check col-md-2">
                  <label for={"include_opening_ids_"+i*2}>Row {i} Opening</label>
                  <Multiselect name={"include_opening_ids_"+i*2}
                               options={this.state.info.openings}
                               selectionLimit='1'
                               onSelect={this.onSelect.bind(this, this.state.post_params["include_opening_ids_"+i*2])}
                               onRemove={this.onRemove.bind(this, this.state.post_params["include_opening_ids_"+i*2])}
                               displayValue='name'/>
               </div>
               <div class="col-md-2 align-self-center text-center">
                   <h5>vs</h5>
               </div>
               <div class="form-check col-md-2">
                  <label for={"include_civ_ids_"+(i*2+1)}>Row {i} Enemy Civ</label>
                  <Multiselect name={"include_civ_ids_"+(i*2+1)}
                               options={this.state.info.civs}
                               selectionLimit='1'
                               onSelect={this.onSelect.bind(this, this.state.post_params["include_civ_ids_"+(i*2+1)])}
                               onRemove={this.onRemove.bind(this, this.state.post_params["include_civ_ids_"+(i*2+1)])}
                               displayValue='name'/>
               </div>
               <div class="form-check col-md-2">
                  <label for={"include_opening_ids_"+(i*2+1)}>Row {i} Enemy Opening</label>
                  <Multiselect name={"include_opening_ids_"+(i*2+1)}
                               options={this.state.info.openings}
                               selectionLimit='1'
                               onSelect={this.onSelect.bind(this, this.state.post_params["include_opening_ids_"+(i*2+1)])}
                               onRemove={this.onRemove.bind(this, this.state.post_params["include_opening_ids_"+(i*2+1)])}
                               displayValue='name'/>
               </div>

            </div>
            )}
          </TabPanel>
          <TabPanel>
            <div class="form-row justify-content-center">
               <div class="form-check col-md-2">
                  <label for={"include_left_civ_combinations"}>Left Civs</label>
                  <Multiselect name={"include_left_civ_combinations"}
                               options={this.state.info.civs}
                               onSelect={this.onSelect.bind(this, this.state.post_params["include_left_civ_combinations"])}
                               onRemove={this.onRemove.bind(this, this.state.post_params["include_left_civ_combinations"])}
                               displayValue='name'/>
               </div>
               <div class="form-check col-md-2">
                  <label for={"include_left_opening_combinations"}>Left Opening</label>
                  <Multiselect name={"include_left_opening_combinations"}
                               options={this.state.info.openings}
                               onSelect={this.onSelect.bind(this, this.state.post_params["include_left_opening_combinations"])}
                               onRemove={this.onRemove.bind(this, this.state.post_params["include_left_opening_combinations"])}
                               displayValue='name'/>
               </div>
               <div class="col-md-2 align-self-center text-center">
                   <h5>vs</h5>
               </div>
               <div class="form-check col-md-2">
                  <label for={"include_right_civ_combinations"}>Right Civs</label>
                  <Multiselect name={"include_right_civ_combinations"}
                               options={this.state.info.civs}
                               onSelect={this.onSelect.bind(this, this.state.post_params["include_right_civ_combinations"])}
                               onRemove={this.onRemove.bind(this, this.state.post_params["include_right_civ_combinations"])}
                               displayValue='name'/>
               </div>
               <div class="form-check col-md-2">
                  <label for={"include_right_opening_combinations"}>Right Opening</label>
                  <Multiselect name={"include_right_opening_combinations"}
                               options={this.state.info.openings}
                               onSelect={this.onSelect.bind(this, this.state.post_params["include_right_opening_combinations"])}
                               onRemove={this.onRemove.bind(this, this.state.post_params["include_right_opening_combinations"])}
                               displayValue='name'/>
               </div>
            </div>
          </TabPanel>
        </Tabs>
        <div class="form-row justify-content-center align-self-center">
          <button class="btn btn-primary" type="submit" disabled={this.state.position > -1}>Submit</button>
        </div>
      </form>
      <div>
      { this.state.position == -3 &&
          <div class="queue">
            <h3> Your request requires too many rows to be processed. The maximum amount is 50. </h3>
          </div>
      }
      { this.state.position == -1 && this.state.data != {} &&
          <div class="queue">
            <DataTable id="civTable" striped responsive data={this.state.data} columns={columns} cellspacing="0" width="80%" defaultSortFieldId={1}/>
          </div>
      }
      { this.state.position == 0 &&
          <div class="queue">
            <h3> Your request is being processed! May take up to a few minutes to process.</h3>
          </div>
      }
      { this.state.position > 0 &&
          <div class="queue">
            <h3> You request is {this.state.position+1} in the queue! Each item in the queue may take up to a few minutes to process.</h3>
          </div>
      }
      </div>
    </div>
    );
  }

}

export default Advanced
