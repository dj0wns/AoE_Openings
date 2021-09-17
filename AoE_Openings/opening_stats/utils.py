from .AoE_Rec_Opening_Analysis.aoe_replay_stats import OpeningType

Basic_Strategies = [
    #General Openings
    [
        "PremillDrush_Any", [OpeningType.PremillDrush.value],
        [OpeningType.Unknown.value]
    ],
    [
        "PostmillDrush_Any", [OpeningType.PostmillDrush.value],
        [OpeningType.Unknown.value]
    ],
    ["MAA_Any", [OpeningType.Maa.value], [OpeningType.AnyDrush.value]],
    [
        "Scouts_Any", [OpeningType.FeudalScoutOpening.value],
        [OpeningType.Unknown.value]
    ],
    [
        "Range_Opener_Any",
        [
            OpeningType.FeudalArcherOpening.value,
            OpeningType.FeudalSkirmOpening.value
        ], [OpeningType.Unknown.value]
    ],
]

Followups = [
    #Specific Openings and followups
    [
        "Premill_Drush_FC", [OpeningType.PremillDrushFC.value],
        [OpeningType.Unknown.value]
    ],
    [
        "Postmill Drush FC", [OpeningType.PostmillDrushFC.value],
        [OpeningType.Unknown.value]
    ],
    [
        "Premill Drush Range Followup",
        [
            OpeningType.PremillDrushArchers.value,
            OpeningType.PremillDrushSkirms.value
        ], [OpeningType.FeudalScoutFollowup.value]
    ],  #disallow scouts
    [
        "Postmill Drush Range Followup",
        [
            OpeningType.PostmillDrushArchers.value,
            OpeningType.PostmillDrushSkirms.value
        ], [OpeningType.FeudalScoutFollowup.value]
    ],  #disallow scouts
    [
        "Scouts (No Feudal Followup)", [OpeningType.FeudalScoutOpening.value],
        [
            OpeningType.FeudalArcherFollowup.value,
            OpeningType.FeudalSkirmFollowup.value
        ]
    ],
    [
        "Scouts Range Followup",
        [OpeningType.ScoutsArchers.value, OpeningType.ScoutsSkirms.value],
        [OpeningType.Unknown.value]
    ],
    [
        "MAA (No Feudal Followup)", [OpeningType.Maa.value],
        [
            OpeningType.FeudalArcherFollowup.value,
            OpeningType.FeudalSkirmFollowup.value,
            OpeningType.FeudalScoutFollowup.value,
            OpeningType.FeudalEagles.value
        ]
    ],
    [
        "MAA Range Followup",
        [OpeningType.MaaSkirms.value, OpeningType.MaaArchers.value],
        [OpeningType.FeudalScoutFollowup.value, OpeningType.FeudalEagles.value]
    ],
]


def generate_aggregate_statements_from_basic_openings():
  aggregate_string = '.aggregate(total_matches=Count("id"),'
  predicate_titles = ["_total", "_wins", "_losses"]
  predicates = ["", "player{}_victory=1", "player{}_victory=0"]
  for opening in Basic_Strategies:
    for predicate in range(len(predicates)):
      aggregate_string+=f'{opening[0]}{predicate_titles[predicate]}=Count(Case('
      for player in range(1,3): #1 indexed
        aggregate_string+='When('
        
        #inclusions
        aggregate_string+='('
        for i in range(len(opening[1])):
          aggregate_string+='('
          for j in range(32):
            if opening[1][i] & 2**j:
              aggregate_string+=f'Q(player{player}_opening_flag{j}=True)'
              aggregate_string+='&'
          #remove trailing and
          aggregate_string = aggregate_string[:-1]
          aggregate_string+=')'
          if i < len(opening[1]) - 1:
            aggregate_string+='|'
        aggregate_string+=')'
        
        #exclusions
        if opening[2][0] != OpeningType.Unknown.value:
          aggregate_string+='&'
          for i in range(len(opening[2])):
            aggregate_string+='('
            for j in range(32):
              if opening[2][i] & 2**j:
                aggregate_string+=f'Q(player{player}_opening_flag{j}=False)'
                if j < 31:
                  aggregate_string+='&'
            #remove trailing and
            aggregate_string = aggregate_string[:-1]
            aggregate_string+=')'
            if i < len(opening[1]) - 1:
              aggregate_string+='&'
        #add a comma
        aggregate_string+=','
        if predicates[predicate]:
          aggregate_string+=f'{predicates[predicate].format(player)},'
        #close the when
        aggregate_string+='then=1),'
      #close the count(case
      aggregate_string+=')),'
  #close aggregate
  aggregate_string+=')'
  return aggregate_string
      
        
    

def generate_filter_statements_from_parameters(min_elo,
                                               max_elo,
                                               include_ladder_ids,
                                               include_patch_ids,
                                               include_map_ids,
                                               include_civ_ids,
                                               include_player_ids):
    filter_string = ".filter("

    if len(include_ladder_ids) and include_ladder_ids[0] != -1:
        count = 0
        for ladder_id in include_ladder_ids:
            if count >0 and count < len(include_ladder_ids):
                filter_string += ' | '
            filter_string += f'Q(ladder_id={ladder_id})'
            count += 1
        filter_string += ","

    if len(include_patch_ids) and include_patch_ids[0] != -1:
        count = 0
        for patch_id in include_patch_ids:
            if count >0 and count < len(include_patch_ids):
                filter_string += ' | '
            filter_string += f'Q(patch_number={patch_id})'
            count += 1
        filter_string += ","

    if len(include_map_ids) and include_map_ids[0] != -1:
        count = 0
        for map_id in include_map_ids:
            if count >0 and count < len(include_map_ids):
                filter_string += ' | '
            filter_string += f'Q(map_id={map_id})'
            count += 1
        filter_string += ","
    
    if len(include_civ_ids) and include_civ_ids[0] != -1:
        count = 0
        for civ_id in include_civ_ids:
            if count >0 and count < len(include_civ_ids):
                filter_string += ' | '
            filter_string += f'Q(player1_civilization={civ_id}) | Q(player2_civilization={civ_id})'
            count += 1
        filter_string += ","
    
    if len(include_player_ids) and include_player_ids[0] != -1:
        count = 0
        for player_id in include_player_ids:
            if count >0 and count < len(include_player_ids):
                filter_string += ' | '
            filter_string += f'Q(player1_id={player_id}) | Q(player2_id={player_id})'
            count += 1
        filter_string += ","
    
    filter_string += f'average_elo__gte={min_elo},'
    filter_string += f'average_elo__lte={max_elo}'
    filter_string += ')'
    return filter_string

def generate_exclude_statements_from_parameters(no_mirror,
                                               exclude_civ_ids):
    exclusions = False
    filter_string = ""


    if len(exclude_civ_ids) and exclude_civ_ids[0] != -1:
        exclusions = True
        count = 0
        for civ_id in exclude_civ_ids:
            filter_string += f'.exclude(player1_civilization={civ_id})'
            filter_string += f'.exclude(player2_civilization={civ_id})'
            count += 1
    
    if no_mirror:
        exclusions = True
        filter_string += '.exclude(player1_civilization=F("player2_civilization"))'
    return filter_string if exclusions else ""
