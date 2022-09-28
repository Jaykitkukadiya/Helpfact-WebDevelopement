from django.contrib import admin
from django.urls import path , include
from . import views

urlpatterns = [
    path('', views.home , name='home'),
    path('404/<str:msg>/', views.nf404 , name='nf'),
    path('dashboard/', views.deshbordcpy , name='deshboard'),
    # path('dashboardcpy/', views.deshbord , name='deshboardcpy'),
    path('login/', views.login , name='login'),
    path('payment/', views.payment , name='payment'),
    path('paytm_payget/', views.paytm_payget , name='paytm_payget'),
    # path('workboard/', views.work_bord , name='workbord'),
    path('workboard/', views.work_bordcpy , name='workbord'),
]
