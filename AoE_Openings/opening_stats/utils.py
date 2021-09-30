from .AoE_Rec_Opening_Analysis.aoe_replay_stats import OpeningType

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


def opening_query_string(inclusions, exclusions, player, predicate):
  #inclusions
  aggregate_string='('
  for i in range(len(inclusions)):
    aggregate_string+='('
    for j in range(32):
      if inclusions[i] & 2**j:
        aggregate_string+=f'Q(player{player}_opening_flag{j}=True)'
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
          aggregate_string+=f'Q(player{player}_opening_flag{j}=False)'
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
  predicate_titles = [ "_total", "_wins", "_losses"]
  predicates = ["", "player{}_victory=1", "player{}_victory=0"]
  strategies = Basic_Strategies + Followups;
  for opening in strategies:
    if not len(opening[2]):
      opening[2].append(OpeningType.Unused.value) #Add unused flag to remove did nothing if no exclusions
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
  predicate_titles = [ "_total", "_wins", "_losses"]
  predicates = ["", "player{}_victory=1", "player{}_victory=0"]
  strategies = Basic_Strategies;
  for opening1 in strategies:
    if not len(opening1[2]):
      opening1[2].append(OpeningType.Unused.value) #Add unused flag to remove did nothing if no exclusions
    for opening2 in strategies:
      if not len(opening2[2]):
        opening2[2].append(OpeningType.Unused.value) #Add unused flag to remove did nothing if no exclusions
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



def generate_filter_statements_from_parameters(min_elo,
                                               max_elo,
                                               include_ladder_ids,
                                               include_patch_ids,
                                               include_map_ids,
                                               include_civ_ids,
                                               clamp_civ_ids,
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

    if len(clamp_civ_ids) and clamp_civ_ids[0] != -1:
        filter_string += "(("
        count = 0
        for civ_id in clamp_civ_ids:
            if count >0 and count < len(clamp_civ_ids):
                filter_string += ' | '
            filter_string += f'Q(player1_civilization={civ_id})'
            count += 1
        filter_string += ") & ("
        count = 0
        for civ_id in clamp_civ_ids:
            if count >0 and count < len(clamp_civ_ids):
                filter_string += ' | '
            filter_string += f'Q(player2_civilization={civ_id})'
            count += 1
        filter_string += "))"
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
