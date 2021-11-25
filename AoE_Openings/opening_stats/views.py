from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django.shortcuts import render
from django.db.models import F, Count, Case, When, Q, Sum, Avg, Value, FloatField
from django.views.decorators.cache import never_cache
from rest_framework import generics
from rest_framework.renderers import JSONRenderer
from opening_stats.models import Openings, Matches, MatchPlayerActions, Maps, Techs, Ladders, Patches, CivEloWins, OpeningEloWins, OpeningEloTechs
from opening_stats.serializers import OpeningsSerializer, MatchesSerializer
from . import utils
import os
import json
import time

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

class LastUploadedMatch(generics.ListAPIView):
  @never_cache
  def list (self, request):
    last_match = Matches.objects.latest("time")
    serializer = MatchesSerializer(last_match)
    content = JSONRenderer().render(serializer.data)
    return HttpResponse(content)

class Info(generics.ListAPIView):
  def list (self, request):
    ret_dict = {}
    civ_list = []
    patches = Patches.objects.all().values()
    patch_list = []
    for patch in patches:
      if patch['id'] > 0:
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
    aggregate_string += utils.generate_filter_statements_from_parameters_for_civ_elo_wins(data)
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
    aggregate_string += utils.generate_filter_statements_from_parameters_for_civ_elo_wins(data, include_opening_ids = False)
    # ignore openings mirrors
    #aggregate_string += ".exclude(opening1_id=F('opening2_id'))"
    aggregate_string += utils.generate_aggregate_statements_from_basic_openings_new()
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
    aggregate_string += utils.generate_filter_statements_from_parameters_for_civ_elo_wins(data, include_opening_ids = False)
    aggregate_string += utils.generate_aggregate_statements_from_opening_matchups_new(data)
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
        aggregate_string+=f'When(Q(elo={i}) & Q(opening1_id={j}) & Q(opening2_id__lt={len(utils.Basic_Strategies)}), then=F("opening1_victory_count") + F("opening1_loss_count")),'
        aggregate_string+=f'When(Q(elo={i}) & Q(opening2_id={j}) & Q(opening1_id__lt={len(utils.Basic_Strategies)}), then=F("opening1_victory_count") + F("opening1_loss_count")),'
        aggregate_string += "))," #close Sum(Case())
    aggregate_string += ')' #close aggregate
    matches = eval(aggregate_string)
    meta_list = utils.count_response_to_dict(matches)
    content = JSONRenderer().render(meta_list)
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
    aggregate_string += utils.generate_filter_statements_from_parameters_for_civ_elo_wins(data, include_opening_ids = False)
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
