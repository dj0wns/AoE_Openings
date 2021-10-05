from .AoE_Rec_Opening_Analysis.aoe_replay_stats import OpeningType

Updated_Tech_Names = {
  101:'Feudal Age',
  102:'Castle Age'
}

Basic_Strategies = [
    #General Openings
    [
        "Premill_Drush_Any", [OpeningType.PremillDrush.value],
        []
    ],
    [
        "Postmill_Drush_Any", [OpeningType.PostmillDrush.value],
        []
    ],
    [
        "MAA_Any",
        [OpeningType.Maa.value],
        [OpeningType.AnyDrush.value]
    ],
    [
        "Scouts_Any", [OpeningType.FeudalScoutOpening.value],
        []
    ],
    [
        "Range_Opener_Any",
        [
            OpeningType.FeudalArcherOpening.value,
            OpeningType.FeudalSkirmOpening.value
        ], []
    ],
    #[
    #    "Fast_Castle",
    #    [OpeningType.FastCastle.value],
    #    [
    #      OpeningType.AnyDrush.value,
    #      OpeningType.FeudalScoutOpening.value,
    #      OpeningType.FeudalArcherOpening.value,
    #      OpeningType.FeudalSkirmOpening.value,
    #      OpeningType.Maa.value
    #    ]
    #],
    #[
    #    "Did_Nothing",
    #    [OpeningType.Unused.value],
    #    [OpeningType.Unknown.value]
    #],
]

Followups = [
    #Specific Openings and followups
    [
        "Premill_Drush_FC", [OpeningType.PremillDrushFC.value],
        []
    ],
    [
        "Postmill_Drush_FC", [OpeningType.PostmillDrushFC.value],
        []
    ],
    [
        "Premill_Drush_Range_Followup",
        [
            OpeningType.PremillDrushArchers.value,
            OpeningType.PremillDrushSkirms.value
        ], [OpeningType.FeudalScoutFollowup.value]
    ],  #disallow scouts
    [
        "Postmill_Drush_Range_Followup",
        [
            OpeningType.PostmillDrushArchers.value,
            OpeningType.PostmillDrushSkirms.value
        ], [OpeningType.FeudalScoutFollowup.value]
    ],  #disallow scouts
    [
        "Scouts_No_Feudal_Followup", [OpeningType.FeudalScoutOpening.value],
        [
            OpeningType.FeudalArcherFollowup.value,
            OpeningType.FeudalSkirmFollowup.value
        ]
    ],
    [
        "Scouts_Range_Followup",
        [OpeningType.ScoutsArchers.value, OpeningType.ScoutsSkirms.value],
        []
    ],
    [
        "MAA_No_Feudal_Followup", [OpeningType.Maa.value],
        [
            OpeningType.AnyDrush.value,
            OpeningType.FeudalArcherFollowup.value,
            OpeningType.FeudalSkirmFollowup.value,
            OpeningType.FeudalScoutFollowup.value
        ]
    ],
    [
        "MAA_Range_Followup",
        [OpeningType.MaaSkirms.value, OpeningType.MaaArchers.value],
        [OpeningType.FeudalScoutFollowup.value]
    ],
]


def parse_standard_query_parameters(request, default_exclude_mirrors) :
  data = {}
  error_code = False
  data['min_elo'] = int(request.GET.get('min_elo', "0").split(",")[0])
  data['max_elo'] = int(request.GET.get('max_elo', "9999").split(",")[0])
  data['exclude_mirrors'] = request.GET.get('exclude_mirrors', str(default_exclude_mirrors)).split(",")[0].lower() == "true"
  data['include_ladder_ids'] = list(map(int, request.GET.get('include_ladder_ids', "-1").split(",")))
  data['include_patch_ids'] = list(map(int, request.GET.get('include_patch_ids', "-1").split(",")))
  data['include_map_ids'] = list(map(int, request.GET.get('include_map_ids', "-1").split(",")))
  data['include_civ_ids'] = list(map(int, request.GET.get('include_civ_ids', "-1").split(",")))
  data['exclude_civ_ids'] = list(map(int, request.GET.get('exclude_civ_ids', "-1").split(",")))
  data['clamp_civ_ids'] = list(map(int, request.GET.get('clamp_civ_ids', "-1").split(",")))
  data['include_player_ids'] = list(map(int, request.GET.get('include_player_ids', "-1").split(",")))

  #Now validate data
  if data['min_elo'] < 0 or data['min_elo'] > 9999 or data['min_elo'] % 25:
    error_code = 400
  if data['max_elo'] < 0 or data['max_elo'] > 9999 or data['max_elo'] % 25:
    error_code = 400
  #TODO Add more db level validations
  return data, error_code

def count_response_to_dict(sql_response) :
  data = {}
  for key, value in sql_response.items():
    # keys are of format civ_victoryType, so split into nested dict because nicer
    # deal with total later
    if key != 'total':
      components = key.split("_")
      name = " ".join(components[:-1])
      type = components[-1]
      if not name in data:
        data[name] = {}
      data[name][type] = value
      data[name]["name"] = name
  return list(data.values())

def count_tech_response_to_dict(sql_response, aoe_data) :
  data = {}
  for key, value in sql_response.items():
    # keys are of format type__tech_name__id, so split into nested dict because nicer
    # deal with total later
    if key != 'total':
      components = key.split("__")
      name = components[0].replace('_',' ')
      type = components[1].replace('_',' ')
      tech_id = components[2].replace('_',' ')
      if not name in data:
        data[name] = {}
      data[name][type] = value  + int(aoe_data["data"]["techs"][str(tech_id)]["ResearchTime"]) * 1000 if value is not None else value
      data[name]["name"] = name
  return list(data.values())

#When doing versus matches we only calculate each matchup once, so mirror matchups to make it easier to view for the end user
def mirror_vs_dict_names(data_list) :
  for i in range(len(data_list)):
    dict2 = data_list[i].copy() #make copy of the current dict, change name and reinsert
    #switch win rate
    if 'wins' in dict2:
      dict2['wins'] = dict2['total'] - data_list[i]['wins']
    print(data_list[i], dict2)
    old_name = data_list[i]['name']
    #split on vs
    components = old_name.split("vs")
    name1 = " ".join(filter(None, components[0].split(" "))) #handy trick to fix formatting
    name2 = " ".join(filter(None, components[1].split(" "))) #handy trick to fix formatting
    if name1 == name2: #dont duplicate mirrors
      continue
    dict2['name'] = name2 + ' vs ' + name1
    data_list.append(dict2)

def opening_query_string(inclusions, exclusions, player, predicate, table_prefix = ""):
  if not len(exclusions):
    exclusions = exclusions + [OpeningType.Unused.value]
  #inclusions
  aggregate_string='('
  for i in range(len(inclusions)):
    aggregate_string+='('
    for j in range(32):
      if inclusions[i] & 2**j:
        aggregate_string+=f'Q({table_prefix}player{player}_opening_flag{j}=True)'
        aggregate_string+='&'
    #remove trailing and
    aggregate_string = aggregate_string[:-1]
    aggregate_string+=')'
    if i < len(inclusions) - 1:
      aggregate_string+='|'
  aggregate_string+=')'

  #exclusions
  if len(exclusions) and exclusions[0] != OpeningType.Unknown.value:
    aggregate_string+='&'
    for i in range(len(exclusions)):
      aggregate_string+='('
      for j in range(32):
        if exclusions[i] & 2**j:
          aggregate_string+=f'Q({table_prefix}player{player}_opening_flag{j}=False)'
          if j <= 31:
            aggregate_string+='&'
      #remove trailing and
      aggregate_string = aggregate_string[:-1]
      aggregate_string+=')'
      if i < len(exclusions) - 1:
        aggregate_string+='&'

  #if victory predicate do the opposite
  if predicate:
    aggregate_string+='&'
    aggregate_string+=f'Q({predicate.format(player)})'
  return aggregate_string


def generate_aggregate_statements_from_basic_openings():
  aggregate_string = '.aggregate(total=Count("id"),'
  predicate_titles = [ "_total", "_wins"]
  predicates = ["", "player{}_victory=1"]
  strategies = Basic_Strategies + Followups;
  for opening in strategies:
    for predicate in range(len(predicates)):
      aggregate_string+=f'{opening[0]}{predicate_titles[predicate]}=Sum(Case('
      #first do mirror case for total, django sum exits at first valid when, so most restrictive case must go first

      #add mirror case for total
      if predicate == 0:
        aggregate_string+='When('
        for player in range(1,3): #1 indexed
          aggregate_string+=opening_query_string(opening[1], opening[2], player, predicates[predicate])
          if player == 1:
            aggregate_string += "&"
          #close the when
        #Add 2 becuase its a mirror and thus they were played twice!
        aggregate_string+=',then=2),'

      for player in range(1,3): #1 indexed
        aggregate_string+='When('
        aggregate_string+=opening_query_string(opening[1], opening[2], player, predicates[predicate])
        aggregate_string+=',then=1),'

      #close the count(case
      aggregate_string+=')),'
  #close aggregate
  aggregate_string+=')'
  return aggregate_string

def generate_aggregate_statements_from_opening_matchups():
  aggregate_string = '.aggregate(total=Count("id"),'
  predicate_titles = [ "_total", "_wins"]
  predicates = ["", "player{}_victory=1"]
  strategies = Basic_Strategies;
  for i in range(len(strategies)):
    opening1 = strategies[i]
    for j in range(i,len(strategies)):
      opening2 = strategies[j]
      for predicate in range(len(predicates)):
        aggregate_string+=f'{opening1[0]}_vs_{opening2[0]}{predicate_titles[predicate]}=Sum(Case('
        for player in range(1,3): #1 indexed
          second_player = (player + 2) % 2 + 1 #This cant be right to get player 2 for one and viceversa but it works so...
          second_predicate = predicates[0] #if player 1 sets victory, player 2 doesnt matter
          aggregate_string+='When('
          aggregate_string+=opening_query_string(opening1[1], opening1[2], player, predicates[predicate])
          aggregate_string += "&"
          aggregate_string+=opening_query_string(opening2[1], opening2[2], second_player, second_predicate)
          aggregate_string+=',then=1),'

        #close the count(case
        aggregate_string+=')),'

        #if a mirror match only get the total then dip
        if opening1==opening2:
          break
  #close aggregate
  aggregate_string+=')'
  return aggregate_string

def generate_filter_statements_from_parameters(data, table_prefix = ""):
    filter_string = ".filter("

    if len(data['include_ladder_ids']) and data['include_ladder_ids'][0] != -1:
        count = 0
        for ladder_id in data['include_ladder_ids']:
            if count >0 and count < len(data['include_ladder_ids']):
                filter_string += ' | '
            filter_string += f'Q({table_prefix}ladder_id={ladder_id})'
            count += 1
        filter_string += ","

    if len(data['include_patch_ids']) and data['include_patch_ids'][0] != -1:
        count = 0
        for patch_id in data['include_patch_ids']:
            if count >0 and count < len(data['include_patch_ids']):
                filter_string += ' | '
            filter_string += f'Q({table_prefix}patch_number={patch_id})'
            count += 1
        filter_string += ","

    if len(data['include_map_ids']) and data['include_map_ids'][0] != -1:
        count = 0
        for map_id in data['include_map_ids']:
            if count >0 and count < len(data['include_map_ids']):
                filter_string += ' | '
            filter_string += f'Q({table_prefix}map_id={map_id})'
            count += 1
        filter_string += ","

    if len(data['include_civ_ids']) and data['include_civ_ids'][0] != -1:
        count = 0
        for civ_id in data['include_civ_ids']:
            if count >0 and count < len(data['include_civ_ids']):
                filter_string += ' | '
            filter_string += f'Q({table_prefix}player1_civilization={civ_id}) | Q({table_prefix}player2_civilization={civ_id})'
            count += 1
        filter_string += ","

    if len(data['clamp_civ_ids']) and data['clamp_civ_ids'][0] != -1:
        filter_string += "(("
        count = 0
        for civ_id in data['clamp_civ_ids']:
            if count >0 and count < len(data['clamp_civ_ids']):
                filter_string += ' | '
            filter_string += f'Q({table_prefix}player1_civilization={civ_id})'
            count += 1
        filter_string += ") & ("
        count = 0
        for civ_id in data['clamp_civ_ids']:
            if count >0 and count < len(data['clamp_civ_ids']):
                filter_string += ' | '
            filter_string += f'Q({table_prefix}player2_civilization={civ_id})'
            count += 1
        filter_string += "))"
        filter_string += ","

    if len(data['include_player_ids']) and data['include_player_ids'][0] != -1:
        count = 0
        for player_id in data['include_player_ids']:
            if count >0 and count < len(data['include_player_ids']):
                filter_string += ' | '
            filter_string += f'Q({table_prefix}player1_id={player_id}) | Q({table_prefix}player2_id={player_id})'
            count += 1
        filter_string += ","

    filter_string += f'{table_prefix}average_elo__gte={data["min_elo"]},'
    filter_string += f'{table_prefix}average_elo__lte={data["max_elo"]}'
    filter_string += ')'
    return filter_string

def generate_exclude_statements_from_parameters(data, table_prefix = ""):
    exclusions = False
    filter_string = ""


    if len(data['exclude_civ_ids']) and data['exclude_civ_ids'][0] != -1:
        exclusions = True
        count = 0
        for civ_id in data['exclude_civ_ids']:
            filter_string += f'.exclude({table_prefix}player1_civilization={civ_id})'
            filter_string += f'.exclude({table_prefix}player2_civilization={civ_id})'
            count += 1

    if data['exclude_mirrors']:
        exclusions = True
        filter_string += f'.exclude({table_prefix}player1_civilization=F("{table_prefix}player2_civilization"))'
    return filter_string if exclusions else ""
