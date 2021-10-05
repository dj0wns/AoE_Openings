from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django.shortcuts import render
from django.db.models import F, Count, Case, When, Q, Sum, Avg, Value
from rest_framework import generics
from rest_framework.renderers import JSONRenderer
from opening_stats.models import Openings, Matches, MatchPlayerActions
from opening_stats.serializers import OpeningsSerializer
from . import utils
import os
import json

with open(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'AoE_Rec_Opening_Analysis', 'aoe2techtree', 'data','data.json')) as json_file:
  aoe_data = json.load(json_file)

# Create your views here.
def index(request):
  return HttpResponse("Hello, world, you made it. Just in the knick of time!")

class OpeningNames(generics.ListAPIView):
  queryset = Openings.objects.all()
  serializer_class = OpeningsSerializer

  def list (self, request):
    queryset = self.get_queryset()
    serializer = OpeningsSerializer(queryset, many=True)
    content = JSONRenderer().render(serializer.data)
    return HttpResponse(content)

class Info(generics.ListAPIView):
  #TODO store this data in the db when possible
  def list (self, request):
    ret_dict = {}
    civ_list = []
    ladder_list = [
      {'name':"Random Map 1v1", 'id':"3"},
      {'name':"Empire Wars 1v1", 'id':"13"},
    ]
    map_list = [
      {'name':"Arabia", 'id':"9"},
      {'name':"Arena", 'id':"29"},
    ]
    patches = Matches.objects.values('patch_number').distinct()
    patch_list = []
    for patch in patches:
      if patch['patch_number'] > 0:
        patch_list.append({'name':patch['patch_number'], 'id':patch['patch_number']})
    ret_dict["patches"] = patch_list

    for name, value in aoe_data["civ_names"].items():
      civ_list.append({"name":name, "id":int(value) - 10270})

    openings = utils.Basic_Strategies + utils.Followups
    opening_list = [{'name':openings[i][0].replace('_',' '), 'id':i} for i in range(len(openings))]

    ret_dict["civs"] = civ_list
    ret_dict["ladders"] = ladder_list
    ret_dict["maps"] = map_list
    ret_dict["openings"] = opening_list
    content = JSONRenderer().render(ret_dict)
    return HttpResponse(content)

class CivWinRates(generics.ListAPIView):
  def list (self, request):
    data, error = utils.parse_standard_query_parameters(request, True)
    if error:
      HttpResponseBadRequest()
    aggregate_string = "Matches.objects"
    aggregate_string += utils.generate_filter_statements_from_parameters(data)
    aggregate_string += utils.generate_exclude_statements_from_parameters(data)
    aggregate_string += '.aggregate('\
            'total=Count("id"),' #data only has games with a conclusion so...
    for name, value in aoe_data["civ_names"].items():
        aggregate_string += f'{name}_wins=Count(Case('\
                                  f'When( player1_civilization={int(value) - 10270}, player1_victory=1, then=1),'\
                                  f'When( player2_civilization={int(value) - 10270}, player2_victory=1, then=1))),'
        aggregate_string += f'{name}_total=Count(Case('\
                                  f'When(player1_civilization={int(value) - 10270}, then=1),'\
                                  f'When(player2_civilization={int(value) - 10270}, then=1))),'
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
      HttpResponseBadRequest()
    aggregate_string = "Matches.objects"
    aggregate_string += utils.generate_filter_statements_from_parameters(data, include_opening_ids = False)
    aggregate_string += utils.generate_exclude_statements_from_parameters(data)
    aggregate_string += utils.generate_aggregate_statements_from_basic_openings()
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
      HttpResponseBadRequest()
    aggregate_string = "Matches.objects"
    aggregate_string += utils.generate_filter_statements_from_parameters(data, include_opening_ids = False)
    aggregate_string += utils.generate_exclude_statements_from_parameters(data)
    aggregate_string += utils.generate_aggregate_statements_from_opening_matchups(data)
    print(aggregate_string)
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
    min_elo = 100
    max_elo = 2500
    bucket_size = int(request.GET.get('bucket_size', "100").split(",")[0])
    if bucket_size < 50 or bucket_size > 200:
      HttpResponseBadRequest()
    aggregate_string = "Matches.objects"
    #TODO FILTER BY NEWEST PATCH
    current_patch = 53347
    aggregate_string += f'.filter(average_elo__gte=100, average_elo__lte=3000, patch_number={current_patch}, ladder_id=3)' #rm only
    aggregate_string += '.aggregate('
    for i in range(min_elo, max_elo, bucket_size):
      for strat in utils.Basic_Strategies:
        aggregate_string += f'{strat[0]}_{i}=Sum(Case('
        #TODO FIX THIS
        # first mirror case
        aggregate_string += "When("
        aggregate_string += utils.opening_query_string(strat[1], strat[2], 1, "")
        aggregate_string += '&'
        aggregate_string += utils.opening_query_string(strat[1], strat[2], 2, "")
        aggregate_string += f',average_elo__gte={i}, average_elo__lt={i+bucket_size}'
        aggregate_string += ",then=2),"
        # p1
        aggregate_string += "When("
        aggregate_string += utils.opening_query_string(strat[1], strat[2], 1, "")
        aggregate_string += f',average_elo__gte={i}, average_elo__lt={i+bucket_size}'
        aggregate_string += ",then=1),"
        # p2
        aggregate_string += "When("
        aggregate_string += utils.opening_query_string(strat[1], strat[2], 2, "")
        aggregate_string += f',average_elo__gte={i}, average_elo__lt={i+bucket_size}'
        aggregate_string += ",then=1)"
        aggregate_string += "))," #close Sum(Case(
    aggregate_string += ')' #close aggregate
    print(aggregate_string)
    matches = eval(aggregate_string)
    meta_list = utils.count_response_to_dict(matches)
    content = JSONRenderer().render(meta_list)
    return HttpResponse(content)

class OpeningTechs(generics.ListAPIView):
  def list (self, request):
    #TODO Make this a query argument
    tech_ids = [101, 102, 103]
    data, error = utils.parse_standard_query_parameters(request, True)
    if error:
      HttpResponseBadRequest()
    aggregate_string = "MatchPlayerActions.objects.select_related('match')"
    aggregate_string += utils.generate_filter_statements_from_parameters(data, 'match__', include_opening_ids = False)
    aggregate_string += '.filter(event_type=3)' #Tech events only
    aggregate_string += '.filter(' #filter on only the tech ids we want
    for i in range(len(tech_ids)):
      aggregate_string += f'Q(event_id={tech_ids[i]})'
      if i + 1 < len(tech_ids):
        aggregate_string += ' | ' #OR
    aggregate_string += ')' #close filter
    aggregate_string += utils.generate_exclude_statements_from_parameters(data, 'match__')
    aggregate_string += '.aggregate(total=Count("match", distinct=True),' #Get a count of games
    for i in tech_ids:
      tech_name = ""
      if i in utils.Updated_Tech_Names:
        tech_name = utils.Updated_Tech_Names[i]
      else:
        tech_name += aoe_data["data"]["techs"][str(i)]["internal_name"]
      tech_name = tech_name.replace(' ', '_') #remove spaces so its a valid variable name
      for strat in utils.Basic_Strategies:
        aggregate_string += f'{strat[0]}__{tech_name}__{i}=Avg(Case('
        # p1
        aggregate_string += "When("
        aggregate_string += utils.opening_query_string(strat[1], strat[2], 1, "", 'match__')
        aggregate_string += f'&Q(player=F("match__player1_id"))'
        aggregate_string += f',event_id={i}'
        aggregate_string += ",then='time'),"
        # p2
        aggregate_string += "When("
        aggregate_string += utils.opening_query_string(strat[1], strat[2], 2, "", 'match__')
        aggregate_string += f'&Q(player=F("match__player2_id"))'
        aggregate_string += f',event_id={i}'
        aggregate_string += ",then='time')"
        aggregate_string += "))," #close Avg(Case(
    aggregate_string += ')' #close aggregate
    print(aggregate_string)
    #aggregate_string += utils.generate_aggregate_statements_from_opening_matchups()
    matches = eval(aggregate_string)
    opening_list = utils.count_tech_response_to_dict(matches, aoe_data)
    out_dict = {"total":matches["total"], "openings_list":opening_list}
    # convert counts to something more readable
    content = JSONRenderer().render(out_dict)
    return HttpResponse(content)
