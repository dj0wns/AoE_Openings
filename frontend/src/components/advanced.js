import React, {Component} from 'react';
import Input from './input';
import DataTable from 'react-data-table-component';
import Multiselect from 'multiselect-react-dropdown';


class Advanced extends Component {
  constructor(props) {
    super(props);
    this.state = {
        info: {civs:[], ladders:[], maps:[], patches:[], openings:[], techs:[]},
        position: -2,
        // Position:
        // -2 means nothing
        // -1 means data or response received from server
        // 0 means data is currently being processed
        // 1 means there is one person in front of you in line
        // etc.
        result:'',
        data: {},
        row_count: 3,
        post_params: {
            min_elo:0,
            max_elo:3000,
            include_patch_ids:[],
            include_ladder_ids:[],
            include_map_ids:[],
            include_civ_ids_0:[]}
        };

    // Add dynamic rows to post params
    // we allow up to 50 rows, so do 100 of these
    for (var i=0; i < 100; ++i) {
      this.state.post_params["include_civ_ids_" + i] = []
      this.state.post_params["include_opening_ids_" + i] = []
    }

    this.handleChange = this.handleChange.bind(this);
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
    console.log(this.query_params)
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
    //Update page name
    this.props.history.push(`${window.location.pathname}`)
    fetch('/api/v1/advanced/', {
      method: 'POST',
      headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state.post_params)
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
    for (var i=target.value; i < 100; ++i) {
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
                   max="50"
                   value={this.state.row_count}
                   onChange={this.handleRowChange}/>
          </div>
        </div>
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
        <div class="form-row justify-content-center align-self-center">
          <button class="btn btn-primary" type="submit" disabled={this.state.position > -1}>Submit</button>
        </div>
      </form>
      <div>
      { this.state.position == -1 && this.state.data != {} &&
          <div class="queue">
            <DataTable id="civTable" striped responsive data={this.state.data} columns={columns} cellspacing="0" width="80%" defaultSortFieldId={1}/>
          </div>
      }
      { this.state.position == 0 &&
          <div class="queue">
            <h3> Your request is being processed! </h3>
          </div>
      }
      { this.state.position > 0 &&
          <div class="queue">
            <h3> You request is {this.state.position+1} in the queue! </h3>
          </div>
      }
      </div>
    </div>
    );
  }

}

export default Advanced
