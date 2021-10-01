from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django.shortcuts import render
from django.db.models import F, Count, Case, When, Q, Sum
from rest_framework import generics
from rest_framework.renderers import JSONRenderer
from opening_stats.models import Openings, Matches
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
    ret_dict["civs"] = civ_list
    ret_dict["ladders"] = ladder_list
    ret_dict["maps"] = map_list
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
    aggregate_string += utils.generate_filter_statements_from_parameters(data)
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
    aggregate_string += utils.generate_filter_statements_from_parameters(data)
    aggregate_string += utils.generate_exclude_statements_from_parameters(data)
    aggregate_string += utils.generate_aggregate_statements_from_opening_matchups()
    matches = eval(aggregate_string)
    # convert counts to something more readable
    opening_list = utils.count_response_to_dict(matches)
    # mirror the matchups
    utils.mirror_vs_dict_names(opening_list)
    out_dict = {"total":matches["total"], "openings_list":opening_list}
    content = JSONRenderer().render(out_dict)
    return HttpResponse(content)
