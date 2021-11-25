from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('info/', views.Info.as_view(), name='info-list'),
    path('opening_names/', views.OpeningNames.as_view(), name='opening_names-list'),
    path('civ_win_rates/', views.CivWinRates.as_view(), name='civ_win_rates-list'),
    path('opening_win_rates/', views.OpeningWinRates.as_view(), name='opening_win_rates-list'),
    path('opening_matchups/', views.OpeningMatchups.as_view(), name='opening_matchups-list'),
    path('opening_techs/', views.OpeningTechs.as_view(), name='opening_techs-list'),
    path('meta_snapshot/', views.MetaSnapshot.as_view(), name='meta_snapshot-list'),
    path('last_uploaded_match/', views.LastUploadedMatch.as_view(), name='last_uploaded_match-list'),
]
