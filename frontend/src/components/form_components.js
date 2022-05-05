import Multiselect from 'multiselect-react-dropdown';
import {stringifyNumber, capitalize} from "./utils";

export const ADVANCED_QUERY_COUNT = 50;

export const GeneralInput = ({data_class}) => (
  <div>
    <div class="form-row">
      <div class="form-group col-md-3 mx-auto">
        <label for="min_elo">Min Elo</label>
        <input type="number"
               class="form-control"
               id="min_elo"
               name="min_elo"
               step="50"
               min="0"
               max="3000"
               value={data_class.state.min_elo}
               onChange={data_class.handleChange}/>
      </div>
      <div class="form-group col-md-3 mx-auto">
        <label for="max_elo">Max Elo</label>
        <input type="number"
               class="form-control"
               id="max_elo"
               name="max_elo"
               step="50"
               min="0"
               max="3000"
               value={data_class.state.max_elo}
               onChange={data_class.handleChange}/>
      </div>
      <div class="form-group col-md-3 mx-auto">
        <label for="left_player_id">Left player aoe2.net id</label>
        <input type="number"
               class="form-control"
               id="left_player_id"
               name="left_player_id"
               min="0"
               value={data_class.state.left_player_id}
               onChange={data_class.handleChange}/>
      </div>
      <div class="form-group col-md-3 center-block civ-div my-auto">
        <input type="checkbox"
               class="form-check-input"
               name="exclude_civ_mirrors"
               id="exclude_civ_mirrors"
               checked={data_class.state.exclude_civ_mirrors}
               onChange={data_class.handleCheckboxChange}/>
        <label for="exclude_civ_mirrors">Exclude Civ Mirrors</label>
        <br/>
        <input type="checkbox"
               class="form-check-input"
               name="exclude_opening_mirrors"
               id="exclude_opening_mirrors"
               checked={data_class.state.exclude_opening_mirrors}
               onChange={data_class.handleCheckboxChange}/>
        <label for="exclude_opening_mirrors">Exclude Opening Mirrors</label>
      </div>
    </div>
    <div class="form-row">
      <div class="form-check col-md-2" >
        <label for="include_ladder_ids">Ladders</label>
        <Multiselect name="include_ladder_ids"
                     options={data_class.state.info.ladders}
                     selectedValues={data_class.state.initial_selected.include_ladder_ids}
                     onSelect={data_class.onSelect.bind(data_class, data_class.state.include_ladder_ids)}
                     onRemove={data_class.onRemove.bind(data_class, data_class.state.include_ladder_ids)}
                     placeholder="All ladders"
                     hidePlaceholder={true}
                     displayValue='name'/>
      </div>
      <div class="form-check col-md-4" >
        <label for="include_patch_ids">Patches</label>
        <Multiselect name="include_patch_ids"
                     options={data_class.state.info.patches}
                     selectedValues={data_class.state.initial_selected.include_patch_ids}
                     onSelect={data_class.onSelect.bind(data_class, data_class.state.include_patch_ids)}
                     onRemove={data_class.onRemove.bind(data_class, data_class.state.include_patch_ids)}
                     placeholder="All patches"
                     hidePlaceholder={true}
                     displayValue='name'/>
      </div>
      <div class="form-check col-md-4">
        <label for="include_map_ids">Maps</label>
        <Multiselect name="include_map_ids"
                     options={data_class.state.info.maps}
                     selectedValues={data_class.state.initial_selected.include_map_ids}
                     onSelect={data_class.onSelect.bind(data_class, data_class.state.include_map_ids)}
                     onRemove={data_class.onRemove.bind(data_class, data_class.state.include_map_ids)}
                     placeholder="All maps"
                     hidePlaceholder={true}
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
               value={data_class.state.row_count}
               onChange={data_class.handleRowChange}/>
      </div>
    </div>
  </div>
);

export const SubmitButton = ({data_class}) => (
  <div class="form-row justify-content-center align-self-center">
    <button class="btn btn-primary" type="submit" disabled={data_class.state.position > -1}>Submit</button>
  </div>
);

export const AdvancedFreeEntry = ({data_class}) => (
  <div>
    {[...Array(data_class.state.row_count)].map((x,i) =>
      <div class="form-row justify-content-center">
         <div class="form-check col-md-2">
            <label for={"include_civ_ids_"+i*2}>{capitalize(stringifyNumber(i+1))} Civ</label>
            <Multiselect name={"include_civ_ids_"+i*2}
                         options={data_class.state.info.civs}
                         selectionLimit='1'
                         onSelect={data_class.onSelect.bind(data_class, data_class.state["include_civ_ids_"+i*2])}
                         onRemove={data_class.onRemove.bind(data_class, data_class.state["include_civ_ids_"+i*2])}
                         selectedValues={data_class.state.initial_selected["include_civ_ids_"+i*2]}
                         placeholder="All civilizations"
                         hidePlaceholder={true}
                         displayValue='name'/>
         </div>
         <div class="form-check col-md-2">
            <label for={"include_opening_ids_"+i*2}>{capitalize(stringifyNumber(i+1))} Opening</label>
            <Multiselect name={"include_opening_ids_"+i*2}
                         options={data_class.state.info.openings}
                         selectionLimit='1'
                         onSelect={data_class.onSelect.bind(data_class, data_class.state["include_opening_ids_"+i*2])}
                         onRemove={data_class.onRemove.bind(data_class, data_class.state["include_opening_ids_"+i*2])}
                         selectedValues={data_class.state.initial_selected["include_opening_ids_"+i*2]}
                         placeholder="All openings"
                         hidePlaceholder={true}
                         displayValue='name'/>
         </div>
         <div class="col-md-2 align-self-center text-center">
             <h5>vs</h5>
         </div>
         <div class="form-check col-md-2">
            <label for={"include_civ_ids_"+(i*2+1)}>{capitalize(stringifyNumber(i+1))} Enemy Civ</label>
            <Multiselect name={"include_civ_ids_"+(i*2+1)}
                         options={data_class.state.info.civs}
                         selectionLimit='1'
                         onSelect={data_class.onSelect.bind(data_class, data_class.state["include_civ_ids_"+(i*2+1)])}
                         onRemove={data_class.onRemove.bind(data_class, data_class.state["include_civ_ids_"+(i*2+1)])}
                         selectedValues={data_class.state.initial_selected["include_civ_ids_"+(i*2+1)]}
                         placeholder="All civilizations"
                         hidePlaceholder={true}
                         displayValue='name'/>
         </div>
         <div class="form-check col-md-2">
            <label for={"include_opening_ids_"+(i*2+1)}>{capitalize(stringifyNumber(i+1))} Enemy Opening</label>
            <Multiselect name={"include_opening_ids_"+(i*2+1)}
                         options={data_class.state.info.openings}
                         selectionLimit='1'
                         onSelect={data_class.onSelect.bind(data_class, data_class.state["include_opening_ids_"+(i*2+1)])}
                         onRemove={data_class.onRemove.bind(data_class, data_class.state["include_opening_ids_"+(i*2+1)])}
                         selectedValues={data_class.state.initial_selected["include_opening_ids_"+(i*2+1)]}
                         placeholder="All openings"
                         hidePlaceholder={true}
                         displayValue='name'/>
         </div>

      </div>
    )}
  </div>
);

export const AdvancedCombinationEntry = ({data_class}) => (
  <div class="form-row justify-content-center">
    <div class="form-check col-md-2">
       <label for={"include_left_civ_combinations"}>Left Civilizations</label>
       <Multiselect name={"include_left_civ_combinations"}
                    options={data_class.state.info.civs}
                    onSelect={data_class.onSelect.bind(data_class, data_class.state["include_left_civ_combinations"])}
                    onRemove={data_class.onRemove.bind(data_class, data_class.state["include_left_civ_combinations"])}
                    placeholder="All civilizations"
                    selectedValues={data_class.state.initial_selected["include_left_civ_combinations"]}
                    hidePlaceholder={true}
                    displayValue='name'/>
    </div>
    <div class="form-check col-md-2">
       <label for={"include_left_opening_combinations"}>Left Openings</label>
       <Multiselect name={"include_left_opening_combinations"}
                    options={data_class.state.info.openings}
                    onSelect={data_class.onSelect.bind(data_class, data_class.state["include_left_opening_combinations"])}
                    onRemove={data_class.onRemove.bind(data_class, data_class.state["include_left_opening_combinations"])}
                    selectedValues={data_class.state.initial_selected["include_left_opening_combinations"]}
                    placeholder="All openings"
                    hidePlaceholder={true}
                    displayValue='name'/>
    </div>
    <div class="col-md-2 align-self-center text-center">
        <h5>vs</h5>
    </div>
    <div class="form-check col-md-2">
       <label for={"include_right_civ_combinations"}>Right Civilizations</label>
       <Multiselect name={"include_right_civ_combinations"}
                    options={data_class.state.info.civs}
                    onSelect={data_class.onSelect.bind(data_class, data_class.state["include_right_civ_combinations"])}
                    onRemove={data_class.onRemove.bind(data_class, data_class.state["include_right_civ_combinations"])}
                    selectedValues={data_class.state.initial_selected["include_right_civ_combinations"]}
                    placeholder="All civilizations"
                    hidePlaceholder={true}
                    displayValue='name'/>
    </div>
    <div class="form-check col-md-2">
       <label for={"include_right_opening_combinations"}>Right Openings</label>
       <Multiselect name={"include_right_opening_combinations"}
                    options={data_class.state.info.openings}
                    onSelect={data_class.onSelect.bind(data_class, data_class.state["include_right_opening_combinations"])}
                    onRemove={data_class.onRemove.bind(data_class, data_class.state["include_right_opening_combinations"])}
                    selectedValues={data_class.state.initial_selected["include_right_opening_combinations"]}
                    placeholder="All openings"
                    hidePlaceholder={true}
                    displayValue='name'/>
    </div>
  </div>
);
