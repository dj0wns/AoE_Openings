from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.db.models import F, Count, Case, When, Q
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
    min_elo = int(request.GET.get('min_elo', "0").split(",")[0])
    max_elo = int(request.GET.get('max_elo', "9999").split(",")[0])
    exclude_mirrors = request.GET.get('exclude_mirrors', "True").split(",")[0].lower() == "true"
    include_ladder_ids = list(map(int, request.GET.get('include_ladder_ids', "-1").split(",")))
    include_patch_ids = list(map(int, request.GET.get('include_patch_ids', "-1").split(",")))
    include_map_ids = list(map(int, request.GET.get('include_map_ids', "-1").split(",")))
    include_civ_ids = list(map(int, request.GET.get('include_civ_ids', "-1").split(",")))
    exclude_civ_ids = list(map(int, request.GET.get('exclude_civ_ids', "-1").split(",")))
    clamp_civ_ids = list(map(int, request.GET.get('clamp_civ_ids', "-1").split(",")))
    include_player_ids = list(map(int, request.GET.get('include_player_ids', "-1").split(",")))
    aggregate_string = "Matches.objects"
    aggregate_string += utils.generate_filter_statements_from_parameters(min_elo,
                                                                         max_elo,
                                                                         include_ladder_ids,
                                                                         include_patch_ids,
                                                                         include_map_ids,
                                                                         include_civ_ids,
                                                                         clamp_civ_ids,
                                                                         include_player_ids);
    aggregate_string += utils.generate_exclude_statements_from_parameters(exclude_mirrors,
                                                                          exclude_civ_ids)
    print(aggregate_string, exclude_mirrors)
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
    civ_dict = {}
    for key, value in matches.items():
      # keys are of format civ_victoryType, so split into nested dict because nicer
      # deal with total later
      if key != 'total':
        components = key.split("_")
        if not components[0] in civ_dict:
          civ_dict[components[0]] = {}
        civ_dict[components[0]][components[1]] = value
        civ_dict[components[0]]["name"] = components[0]
    out_dict = {"total":matches["total"], "civs_list":civ_dict.values()}
    content = JSONRenderer().render(out_dict)
    return HttpResponse(content)

class OpeningWinRates(generics.ListAPIView):
  def list (self, request):
    min_elo = int(request.GET.get('min_elo', "0").split(",")[0])
    max_elo = int(request.GET.get('max_elo', "9999").split(",")[0])
    exclude_mirrors = request.GET.get('exclude_mirrors', "False").split(",")[0].lower() == "true"
    include_ladder_ids = list(map(int, request.GET.get('include_ladder_ids', "-1").split(",")))
    include_patch_ids = list(map(int, request.GET.get('include_patch_ids', "-1").split(",")))
    include_map_ids = list(map(int, request.GET.get('include_map_ids', "-1").split(",")))
    include_civ_ids = list(map(int, request.GET.get('include_civ_ids', "-1").split(",")))
    exclude_civ_ids = list(map(int, request.GET.get('exclude_civ_ids', "-1").split(",")))
    clamp_civ_ids = list(map(int, request.GET.get('clamp_civ_ids', "-1").split(",")))
    include_player_ids = list(map(int, request.GET.get('include_player_ids', "-1").split(",")))
    aggregate_string = "Matches.objects"
    aggregate_string += utils.generate_filter_statements_from_parameters(min_elo,
                                                                         max_elo,
                                                                         include_ladder_ids,
                                                                         include_patch_ids,
                                                                         include_map_ids,
                                                                         include_civ_ids,
                                                                         clamp_civ_ids,
                                                                         include_player_ids);
    aggregate_string += utils.generate_exclude_statements_from_parameters(exclude_mirrors,
                                                                          exclude_civ_ids)
    aggregate_string += utils.generate_aggregate_statements_from_basic_openings()
    print (aggregate_string)
    matches = eval(aggregate_string)
    content = JSONRenderer().render(matches)
    return HttpResponse(content)
