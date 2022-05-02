from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django.shortcuts import render
from django.db.models import F, Count, Case, When, Q, Sum, Avg, Value, FloatField
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from rest_framework import generics, views, status
from rest_framework.renderers import JSONRenderer
from rest_framework_api_key.permissions import HasAPIKey
from opening_stats.models import Openings, Matches, MatchPlayerActions, Maps, Techs, Ladders, Patches, CivEloWins, OpeningEloWins, OpeningEloTechs, Players, AdvancedQueryResults, AdvancedQueryQueue
from opening_stats.serializers import OpeningsSerializer, MatchesSerializer, MatchInputSerializer, TestSerializer, MatchPlayerActionsSerializer, PlayersSerializer, PatchesSerializer
from . import utils
import os
import json
import time
import uuid

with open(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'AoE_Rec_Opening_Analysis', 'aoe2techtree', 'data','data.json')) as json_file:
  aoe_data = json.load(json_file)

class OpeningNames(generics.ListAPIView):
  queryset = Openings.objects.all()
  serializer_class = OpeningsSerializer

  def list (self, request):
    queryset = self.get_queryset()
    serializer = OpeningsSerializer(queryset, many=True)
    content = JSONRenderer().render(serializer.data)
    return HttpResponse(content)

class LastUploadedMatch(generics.ListAPIView):
  @never_cache
  def list (self, request):
    if Matches.objects.exists():
      last_match = Matches.objects.latest("time")
      serializer = MatchesSerializer(last_match)
      content = JSONRenderer().render(serializer.data)
      return HttpResponse(content)
    else:
      content = JSONRenderer().render({"time":0})
      return HttpResponse(content)

class Info(generics.ListAPIView):
  def list (self, request):
    ret_dict = {}
    civ_list = []
    patches = Patches.objects.all().values().order_by('-id')
    patch_list = []
    for patch in patches:
      if patch['id'] > 0:
        if patch['description']:
          patch_list.append({'name':f'{patch["id"]} ({patch["description"]})', 'id':patch['id']})
        else:
          patch_list.append({'name':patch['id'], 'id':patch['id']})
    ret_dict["patches"] = patch_list

    for name, value in aoe_data["civ_names"].items():
      civ_list.append({"name":name, "id":int(value) - 10270})

    openings = utils.Basic_Strategies + utils.Followups
    opening_list = [{'name':openings[i][0].replace('_',' '), 'id':i} for i in range(len(openings))]

    ret_dict["civs"] = civ_list
    ret_dict["ladders"] = Ladders.objects.order_by('name').values()
    ret_dict["maps"] = Maps.objects.order_by('name').values()
    ret_dict["techs"] = Techs.objects.order_by('name').values()
    ret_dict["openings"] = opening_list
    content = JSONRenderer().render(ret_dict)
    return HttpResponse(content)

class CivWinRates(generics.ListAPIView):
  def list (self, request):
    data, error = utils.parse_standard_query_parameters(request, True)
    if error:
      return HttpResponseBadRequest()
    aggregate_string = "CivEloWins.objects"
    aggregate_string += utils.generate_filter_statements_from_parameters(data)
    aggregate_string += '.aggregate('\
            'total=Sum("victory_count"),' #data only has games with a conclusion so only saves wins and its ezpz
    for name, value in aoe_data["civ_names"].items():
        aggregate_string += f'{name}_wins=Sum(Case('\
                                  f'When( civilization={int(value) - 10270}, then=F("victory_count")))),'
        aggregate_string += f'{name}_total=Sum(Case('\
                                  f'When( civilization={int(value) - 10270}, then=F("victory_count") + F("loss_count")))),'
    aggregate_string += ')'
    matches = eval(aggregate_string)
    # convert counts to something more readable
    civ_list = utils.count_response_to_dict(matches)
    out_dict = {"total":matches["total"], "civs_list":civ_list}
    content = JSONRenderer().render(out_dict)
    return HttpResponse(content)

class OpeningWinRates(generics.ListAPIView):
  def list (self, request):
    data, error = utils.parse_standard_query_parameters(request, True)
    if error:
      return HttpResponseBadRequest()
    aggregate_string = "OpeningEloWins.objects"
    aggregate_string += utils.generate_filter_statements_from_parameters(data, include_opening_ids = False)
    # ignore openings mirrors
    #aggregate_string += ".exclude(opening1_id=F('opening2_id'))"
    aggregate_string += utils.generate_aggregate_statements_from_basic_openings(data)
    matches = eval(aggregate_string)
    # convert counts to something more readable
    opening_list = utils.count_response_to_dict(matches)
    out_dict = {"total":matches["total"], "openings_list":opening_list}
    content = JSONRenderer().render(out_dict)
    return HttpResponse(content)

class OpeningMatchups(generics.ListAPIView):
  def list (self, request):
    data, error = utils.parse_standard_query_parameters(request, True)
    if error:
      return HttpResponseBadRequest()
    aggregate_string = "OpeningEloWins.objects"
    aggregate_string += utils.generate_filter_statements_from_parameters(data, include_opening_ids = False)
    aggregate_string += utils.generate_aggregate_statements_from_opening_matchups(data)
    matches = eval(aggregate_string)
    # convert counts to something more readable
    opening_list = utils.count_response_to_dict(matches)
    # mirror the matchups
    utils.mirror_vs_dict_names(opening_list)
    out_dict = {"total":matches["total"], "openings_list":opening_list}
    content = JSONRenderer().render(out_dict)
    return HttpResponse(content)

class MetaSnapshot(generics.ListAPIView):
  def list (self, request):
    min_elo = 500
    max_elo = 2500
    bucket_size = int(request.GET.get('bucket_size', "50").split(",")[0])
    if bucket_size < 50 or bucket_size > 200:
      return HttpResponseBadRequest()
    aggregate_string = "OpeningEloWins.objects"
    current_patch = Patches.objects.all().last().id
    aggregate_string += f'.filter(elo__gte={min_elo}, elo__lte={max_elo}, patch_number={current_patch}, ladder_id=3)' #rm only
    aggregate_string += '.aggregate('
    for i in range(min_elo, max_elo, bucket_size):
      for j in range(len(utils.Basic_Strategies)):
        aggregate_string += f'{utils.Basic_Strategies[j][0]}_{i}=Sum(Case('
        #have to double count mirrors
        aggregate_string+=f'When(Q(elo={i}) & Q(opening1_id={j}) & Q(opening2_id={j}), then=F("opening1_victory_count") + F("opening1_loss_count") + F("opening2_victory_count") + F("opening2_loss_count")),'
        aggregate_string+=f'When(Q(elo={i}) & Q(opening1_id={j}) & Q(opening2_id__lt={len(utils.Basic_Strategies)}), then=F("opening1_victory_count") + F("opening1_loss_count")),'
        aggregate_string+=f'When(Q(elo={i}) & Q(opening2_id={j}) & Q(opening1_id__lt={len(utils.Basic_Strategies)}), then=F("opening1_victory_count") + F("opening1_loss_count")),'
        aggregate_string += "))," #close Sum(Case())
    aggregate_string += ')' #close aggregate
    matches = eval(aggregate_string)
    meta_list = utils.count_response_to_dict(matches)
    return_dict = {'patch':current_patch, 'meta_list':meta_list}
    content = JSONRenderer().render(return_dict)
    return HttpResponse(content)

class OpeningTechs(generics.ListAPIView):
  def list (self, request):
    data, error = utils.parse_standard_query_parameters(request, True)
    if error:
      return HttpResponseBadRequest()

    #pull tech ids from query arg or default to age up times
    if len(data['include_tech_ids']) and data['include_tech_ids'][0] != -1:
      tech_ids = data['include_tech_ids']
    else:
      tech_ids = [101, 102, 103]
    #pull strategies from query arg or default to basic
    if len(data['include_opening_ids']) and data['include_opening_ids'][0] != -1:
      strategies = data['include_opening_ids']
    else:
      strategies = range(len(utils.Basic_Strategies));

    #get tech names, fall back to data sheet if needed
    tech_ids_to_names = {}
    for i in tech_ids:
      tech = Techs.objects.get(pk=i)
      if tech:
        tech_ids_to_names[i] = tech.name.replace(' ', '_') #remove spaces so its a valid variable name
      elif i in aoe_data["data"]["techs"]:
        tech_ids_to_names[i] = aoe_data["data"]["techs"][str(i)]["internal_name"].replace(' ', '_')
      else:
        #unknown tech, error out
        return HttpResponseBadRequest()

    aggregate_string = "OpeningEloTechs.objects"
    aggregate_string += utils.generate_filter_statements_from_parameters(data, include_opening_ids = False)
    aggregate_string += '.filter(' #filter on only the tech ids we want
    for i in range(len(tech_ids)):
      aggregate_string += f'Q(tech_id={tech_ids[i]})'
      if i + 1 < len(tech_ids):
        aggregate_string += ' | ' #OR
    aggregate_string += ')' #close filter
    aggregate_string += '.aggregate(total=Sum("count"),' #Get a count of games
    for i in tech_ids:
      for opening_id in strategies:
        opening_name = utils.OPENINGS[opening_id][0]
        aggregate_string += f'{opening_name}__{tech_ids_to_names[i]}__{i}=Sum('
        aggregate_string += f'Case(When(opening_id={opening_id}, tech_id={i}, then=F("average_time")*F("count"))))'
        aggregate_string += f'/ Sum(Case(When(opening_id={opening_id}, tech_id={i},then="count")), output_field=FloatField()),'
    aggregate_string += ')' #close aggregate
    matches = eval(aggregate_string)
    opening_list = utils.count_tech_response_to_dict(matches, aoe_data)
    out_dict = {"total":matches["total"], "openings_list":opening_list}
    # convert counts to something more readable
    content = JSONRenderer().render(out_dict)
    return HttpResponse(content)

class Advanced(views.APIView):
  @never_cache
  def get(self, request):
    request_id = request.GET.get('id',"")
    try:
      uuid_key = uuid.UUID(request_id, version=4)
    except ValueError:
      return HttpResponseBadRequest()
    result = AdvancedQueryResults.objects.get(pk=uuid_key)
    if result is None:
      return HttpResponseBadRequest()
    query_obj = result.advancedqueryqueue_set.first()
    query = query_obj.query
    date = "N/A"
    if query_obj.time_completed is not None:
      date = query_obj.time_completed.strftime("%d/%m/%Y")
    result_list = utils.count_response_to_dict(result.data)
    ret_dict = {'result':result_list, 'query':query, 'date':date}
    content = JSONRenderer().render(ret_dict)
    return HttpResponse(content)

  @never_cache
  def post(self, request, format=None):
    data, error = utils.parse_advanced_post_parameters(request, True)
    if error:
      return HttpResponseBadRequest()
    result = utils.EnqueueOrCheckAdvancedRequest(data)
    out_dict = {'position':-1,
                'result':""}
    if type(result) is uuid.UUID:
      out_dict['result'] = result
    else:
      out_dict['position'] = result
    content = JSONRenderer().render(out_dict)
    return HttpResponse(content)

class ImportMatches(views.APIView):
  permission_classes = [HasAPIKey]
  def post (self, request, format=None):
    start = time.time()
    civs_data_dict = {}
    openings_data_dict = {}
    techs_data_dict = {}

    players_serializer = PlayersSerializer(data=request.data['players'], many=True)
    patches_serializer = PatchesSerializer(data=request.data['patches'], many=True)
    #create players and patches
    players_serializer.is_valid(raise_exception=True)
    patches_serializer.is_valid(raise_exception=True)
    def player_generator():
      for player in players_serializer.validated_data:
        (yield Players(**player))
    def patch_generator():
      for patch in patches_serializer.validated_data:
        (yield Patches(**patch))

    Players.objects.bulk_create(player_generator(), ignore_conflicts=True)
    Patches.objects.bulk_create(patch_generator(), ignore_conflicts=True)

    matches_serializer = MatchesSerializer(data=request.data['matches'], many=True)
    actions_serializer = MatchPlayerActionsSerializer(data=request.data['match_player_actions'], many=True)
    matches_serializer.is_valid(raise_exception=True)

    matches = matches_serializer.save()

    print("Building match data_dicts")
    for match in matches:
      utils.build_civ_elo_win_for_match(match, civs_data_dict)
      utils.build_opening_elo_win_for_match(match, openings_data_dict)

    print("Updating civ wins and losses")
    total = len(civs_data_dict)
    print("Rows to modify: " + str(total))
    civs_objs = []
    for k,v in civs_data_dict.items():
      # try update, else create object to insert with bulk create later
      updated_count = CivEloWins.objects.filter(
          civilization=k[0],
          map_id=k[1],
          ladder_id=k[2],
          patch_number=k[3],
          elo=k[4]).update(
              victory_count=F('victory_count') + v['victory_count'],
              loss_count=F('loss_count') + v['loss_count'])
      if updated_count == 0:
        obj = CivEloWins(
          civilization=k[0],
          map_id=k[1],
          ladder_id=k[2],
          patch_number=k[3],
          elo=k[4],
          victory_count=v['victory_count'],
          loss_count=v['loss_count'])
        civs_objs.append(obj)
    if len(civs_objs):
      CivEloWins.objects.bulk_create(civs_objs)
    del civs_objs
    del civs_data_dict

    print("Updating opening matchups")
    total = len(openings_data_dict)
    print("Rows to modify: " + str(total))
    openings_objs = []
    for k,v in openings_data_dict.items():
      # try update, else create object to insert with bulk create later
      updated_count = OpeningEloWins.objects.filter(
          opening1_id=k[0],
          opening2_id=k[1],
          map_id=k[2],
          ladder_id=k[3],
          patch_number=k[4],
          elo=k[5]).update(
              opening1_victory_count=F('opening1_victory_count') + v['opening1_victory_count'],
              opening1_loss_count=F('opening1_loss_count') + v['opening1_loss_count'],
              opening2_victory_count=F('opening2_victory_count') + v['opening2_victory_count'],
              opening2_loss_count=F('opening2_loss_count') + v['opening2_loss_count'])
      if updated_count == 0:
        obj = OpeningEloWins(
          opening1_id=k[0],
          opening2_id=k[1],
          map_id=k[2],
          ladder_id=k[3],
          patch_number=k[4],
          elo=k[5],
          opening1_victory_count=v['opening1_victory_count'],
          opening1_loss_count=v['opening1_loss_count'],
          opening2_victory_count=v['opening2_victory_count'],
          opening2_loss_count=v['opening2_loss_count'])
        openings_objs.append(obj)
    if len(openings_objs):
      OpeningEloWins.objects.bulk_create(openings_objs)
    del openings_objs
    del openings_data_dict

    print('Serializing actions!')
    actions_serializer.is_valid(raise_exception=True)
    actions_input = actions_serializer.validated_data
    def match_actions_generator():
      for action in actions_input:
        (yield MatchPlayerActions(**action))


    print('Creating actions!')
    actions = MatchPlayerActions.objects.bulk_create(match_actions_generator())

    print('Creating opening elo techs dict')
    previous_match_id = -2
    previous_match = False
    previous_match_openings = {}
    techs = [tech.id for tech in Techs.objects.all().iterator()]
    for action in actions:
      #ignore techs we dont care about currently
      if action.event_type != 3 or action.event_id not in techs:
        continue
      if action.match_id == previous_match_id:
        match = previous_match
      else:
        match = Matches.objects.filter(id=action.match_id).first()
      previous_match_openings = utils.build_opening_elo_techs_for_match_and_action(match, action, techs_data_dict, previous_match_id, previous_match_openings)
      #update last match cache
      previous_match_id = action.match_id
      previous_match = match

    print("Updating elo techs")
    total = len(techs_data_dict)
    print("Rows to modify: " + str(total))
    techs_objs = []
    for k,v in techs_data_dict.items():
      # try update, else create object to insert with bulk create later
      updated_count = OpeningEloTechs.objects.filter(
          opening_id=k[0],
          tech_id=k[1],
          map_id=k[2],
          ladder_id=k[3],
          patch_number=k[4],
          elo=k[5]).update(
              average_time=(F('average_time') * F('count') + v['average_time'] * v['research_count']) / (F('count') + v['research_count']),
              count = F('count') + v['research_count'])
      # if no records were updated
      if updated_count == 0:
        obj = OpeningEloTechs(
          opening_id=k[0],
          tech_id=k[1],
          map_id=k[2],
          ladder_id=k[3],
          patch_number=k[4],
          elo=k[5],
          average_time=v['average_time'],
          count=v['research_count'])
        techs_objs.append(obj)

    if len(techs_objs):
      OpeningEloTechs.objects.bulk_create(techs_objs)

    end = time.time()
    print(f"ImportMatches took {end-start} seconds to complete!")
    # Invalidate advanced queue
    AdvancedQueryQueue.objects.filter(stale=False).order_by('id').update(stale=True)
    return HttpResponse("You are loved <3", status=status.HTTP_201_CREATED)
