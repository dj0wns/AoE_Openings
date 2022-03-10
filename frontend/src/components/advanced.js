import React, {Component} from 'react';
import 'react-tabs/style/react-tabs.css';
import DataTable from 'react-data-table-component';
import {Tabs, Tab} from 'react-bootstrap';
import {cartesian, stringifyNumber, formatArgumentsForMultiSelect} from "./utils";
import {GeneralInput, SubmitButton, AdvancedFreeEntry, AdvancedCombinationEntry, ADVANCED_QUERY_COUNT} from './form_components';

const StatusText = ({data_class, columns}) => (
  <div>
    { data_class.state.position == -3 &&
        <div class="queue">
          <h3> Your request requires too many rows to be processed. The maximum amount is 50. </h3>
        </div>
    }
    { data_class.state.position == -1 && data_class.state.data != {} &&
        <div class="queue">
          <h3> This data was processed on {data_class.state.date} </h3>
          <DataTable id="civTable" striped responsive data={data_class.state.data} columns={columns} cellspacing="0" width="80%" defaultSortFieldId={1}/>
        </div>
    }
    { data_class.state.position == 0 &&
        <div class="queue">
          <h3> Your request is being processed! May take up to a few minutes to process.</h3>
        </div>
    }
    { data_class.state.position > 0 &&
        <div class="queue">
          <h3> You request is {stringifyNumber(data_class.state.position+1)} in the queue! Each item in the queue may take up to a few minutes to process.</h3>
        </div>
    }
  </div>
);

const FreeEntryForm = ({data_class}) => (
  <form onSubmit={data_class.handleSubmit}>
    <GeneralInput data_class={data_class}/>
    <AdvancedFreeEntry data_class={data_class}/>
    <SubmitButton data_class={data_class}/>
  </form>
);

const ComboEntryForm = ({data_class}) => (
  <form onSubmit={data_class.handleSubmit}>
    <GeneralInput data_class={data_class}/>
    <AdvancedCombinationEntry data_class={data_class}/>
    <SubmitButton data_class={data_class}/>
  </form>
);

class Advanced extends Component {
  constructor(props) {
    super(props);
    this.state = {
        info: {civs:[], ladders:[], maps:[], patches:[], openings:[], techs:[]},
        // Position:
        // -3 Error: too many combinations selected - total selected / max selected
        // -2 means nothing
        // -1 means data or response received from server
        // 0 means data is currently being processed
        // 1 means there is one person in front of you in line
        // etc.
        position: -2,
        result:'',
        data: {},
        date: "",
        row_count: 3,
        // tab_index: index for input type tabs:
        // 0 Free Entry
        // 1 Combinatorics
        tab_index: 0,
        tab_key: "free_entry",
        // initial_selected:
        // Used when loading from a previous query
        initial_selected:{},
        // POST_PARAMS
        min_elo:0,
        max_elo:3000,
        include_patch_ids:[],
        include_ladder_ids:[],
        include_map_ids:[],
        include_left_civ_combinations:[],
        include_left_opening_combinations:[],
        include_right_civ_combinations:[],
        include_right_opening_combinations:[],
        };

    // Add dynamic rows to post params
    // we allow up to 50 rows, so do 100 of these
    for (var i=0; i < ADVANCED_QUERY_COUNT*2; ++i) {
      this.state["include_civ_ids_" + i] = []
      this.state["include_opening_ids_" + i] = []
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleTabs = this.handleTabs.bind(this);
    this.handleRowChange = this.handleRowChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.query_params = this.props.location.search;
    this.onSelect = this.onSelect.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.getPostParams = this.getPostParams.bind(this);
    this.setInitialSelected = this.setInitialSelected.bind(this);
  }

  getPostParams() {
    var post_params = {}
    post_params.min_elo = this.state.min_elo;
    post_params.max_elo = this.state.max_elo;
    post_params.include_patch_ids = this.state.include_patch_ids;
    post_params.include_ladder_ids = this.state.include_ladder_ids;
    post_params.include_map_ids = this.state.include_map_ids;
    if (this.state.tab_index == 1) {
      post_params.include_left_civ_combinations = this.state.include_left_civ_combinations;
      post_params.include_left_opening_combinations = this.state.include_left_opening_combinations;
      post_params.include_right_civ_combinations = this.state.include_right_civ_combinations;
      post_params.include_right_opening_combinations = this.state.include_right_opening_combinations;
    } else {
      for (var i=0; i < ADVANCED_QUERY_COUNT*2; ++i) {
        post_params["include_civ_ids_" + i] = this.state["include_civ_ids_" + i]
        post_params["include_opening_ids_" + i] = this.state["include_opening_ids_" + i]
      }
    }
    return post_params
  }

  setInitialSelected(query) {
    var initial_selected = {}
    if (query.get("min_elo")) {
      this.setState({min_elo:parseInt(query.get("min_elo"))})
    }
    if (query.get("max_elo")) {
      this.setState({max_elo:parseInt(query.get("max_elo"))})
    }
    if (query.get("include_patch_ids")) {
      initial_selected.include_patch_ids =
          formatArgumentsForMultiSelect(query.get("include_patch_ids").split(",").map(Number),
                                        this.state.info.patches)
      this.setState({include_patch_ids:query.get("include_patch_ids").split(",").map(Number)})
    }
    if (query.get("include_map_ids")) {
      initial_selected.include_map_ids =
          formatArgumentsForMultiSelect(query.get("include_map_ids").split(",").map(Number),
                                        this.state.info.maps)
      this.setState({include_map_ids:query.get("include_map_ids").split(",").map(Number)})
    }
    if (query.get("include_ladder_ids")) {
      initial_selected.include_ladder_ids =
          formatArgumentsForMultiSelect(query.get("include_ladder_ids").split(",").map(Number),
                                        this.state.info.ladders)
      this.setState({include_ladder_ids:query.get("include_ladder_ids").split(",").map(Number)})
    }
    // Combo View
    initial_selected.include_left_civ_combinations = []
    var index = -1 ;
    if (query.get("include_left_civ_combinations")) {
      var ids = query.get("include_left_civ_combinations").split(",").map(Number)
      // Remove -1 if exists
      if ((index = ids.indexOf(-1)) > -1) ids.splice(index,1)
      initial_selected.include_left_civ_combinations =
          formatArgumentsForMultiSelect(ids, this.state.info.civs)
      this.setState({include_left_civ_combinations:ids})
    }
    initial_selected.include_left_opening_combinations = []
    if (query.get("include_left_opening_combinations")) {
      var ids = query.get("include_left_opening_combinations").split(",").map(Number)
      // Remove -1 if exists
      if ((index = ids.indexOf(-1)) > -1) ids.splice(index,1)
      initial_selected.include_left_opening_combinations =
          formatArgumentsForMultiSelect(ids, this.state.info.openings)
      this.setState({include_left_opening_combinations:ids})
    }
    initial_selected.include_right_civ_combinations = []
    if (query.get("include_right_civ_combinations")) {
      var ids = query.get("include_right_civ_combinations").split(",").map(Number)
      // Remove -1 if exists
      if ((index = ids.indexOf(-1)) > -1) ids.splice(index,1)
      initial_selected.include_right_civ_combinations =
          formatArgumentsForMultiSelect(ids, this.state.info.civs)
      this.setState({include_right_civ_combinations:ids})
    }
    initial_selected.include_right_opening_combinations = []
    if (query.get("include_right_opening_combinations")) {
      var ids = query.get("include_right_opening_combinations").split(",").map(Number)
      // Remove -1 if exists
      if ((index = ids.indexOf(-1)) > -1) ids.splice(index,1)
      initial_selected.include_right_opening_combinations =
          formatArgumentsForMultiSelect(ids, this.state.info.openings)
      this.setState({include_right_opening_combinations:ids})
    }
    // If any of these have values then we used the combinatorics view
    if (initial_selected.include_left_civ_combinations.length ||
        initial_selected.include_left_opening_combinations.length ||
        initial_selected.include_right_civ_combinations.length ||
        initial_selected.include_right_opening_combinations.length) {
      this.setState({tab_index:1})
      this.setState({tab_key:"combinations"})
    }
    var row_count = 1
    // Free Entry View
    for (var i=0; i < ADVANCED_QUERY_COUNT*2; ++i) {
      var row_found = false
      if (query.get("include_civ_ids_" + i) && parseInt(query.get("include_civ_ids_" + i)) != -1) {
        initial_selected["include_civ_ids_" + i] =
            formatArgumentsForMultiSelect([query.get("include_civ_ids_" + i)],
                                          this.state.info.civs);
        this.setState({["include_civ_ids_" + i]:[parseInt(query.get("include_civ_ids_" + i))]})
        row_found = true;
      }
      if (query.get("include_opening_ids_" + i) && parseInt(query.get("include_opening_ids_" + i)) != -1) {
        initial_selected["include_opening_ids_" + i] =
            formatArgumentsForMultiSelect([query.get("include_opening_ids_" + i)],
                                          this.state.info.openings);
        this.setState({["include_opening_ids_" + i]:[parseInt(query.get("include_opening_ids_" + i))]})
        row_found = true;
      }
      if (row_found) {
        row_count = Math.floor((i+1)/2)
      }
    }
    this.setState({row_count:row_count})
    this.setState({initial_selected:initial_selected})
  }

  componentDidMount() {
    fetch('/api/v1/info/')
    .then(res => res.json())
    .then((data) => {
      data.techs.sort(function(a,b){return a-b});
      this.setState({ info: data });
      // Wait for info query to complete try and set up query params
      if (this.query_params) {
        fetch('/api/v1/advanced/' + this.query_params, {
              method: 'GET',
        }).then((response) => response.json())
          .then((data) => {
          // Invalid string if no result
          if (data.result) {
            this.setState({data:data.result})
            this.setState({date:data.date})
            this.setState({ position: -1});
            this.setInitialSelected(new URLSearchParams(data.query))
          }
        })
      }
    })
    .catch(console.log)
  }

  handleSubmit(event) {
    event.preventDefault();
    var post_params = this.getPostParams();
    if (this.state.tab_index == 1) {
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

            this.setState({date:data.date})
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
    this.setState({row_count:parseInt(target.value)})
    // Clear post params so data isnt double saved
    for (var i=target.value; i < ADVANCED_QUERY_COUNT*2; ++i) {
      this.setState({["include_civ_ids_" + i]:[]})
      this.setState({["include_opening_ids_" + i]:[]})
    }
  }
  handleChange(e) {
    const target = e.target;
    const name = target.name;
    const value = target.value;
    this.setState({
      [name]: parseInt(value)
    });
  }
  handleTabs(key) {
    var index = 0;
    if (key == "free_entry") {
      index = 0;
    } else if (key == "combinations") {
     index = 1;
    }
    this.setState({
      tab_index: index,
      tab_key: key
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
        <Tabs id="form-tab"
              activeKey={this.state.tab_key}
              className="mb-3"
              transition={false}
              onSelect={this.handleTabs}>
          <Tab eventKey="free_entry" title="Free Entry">
            <FreeEntryForm data_class={this}/>
          </Tab>
          <Tab eventKey="combinations" title="Combinations">
            <ComboEntryForm data_class={this}/>
          </Tab>
        </Tabs>
      <div>
        <StatusText data_class={this} columns={columns}/>
      </div>
    </div>
    );
  }

}
export default Advanced
