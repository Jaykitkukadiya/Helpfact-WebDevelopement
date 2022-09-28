from django.shortcuts import render, redirect
from .models import *
from django.views.decorators.csrf import csrf_exempt
from PayTm import Checksum
from django.db.models import Q

MERCHANT_KEY = 'paytm merchant key(secret)'

def home(request):
    if request.user.is_authenticated:
        role = request.user.extended_user_details.role
    else:
        role = "nouser"
    return render(request, 'home.html', {'user_role': role})

def nf404(request, msg="Page Not Found"):
    return render(request, '404.html', {'msg' : msg})


def login(request):
    if str(request.user) == "AnonymousUser":
        return render(request, "login.html")
    else:
        return redirect('/')


def deshbord(request):
    if str(request.user) != "AnonymousUser":
        pending_tasks = pending_task.objects.filter(
            pending_task_user=request.user)
        completed_task_objs = completed_task.objects.filter(
            completed_task_user=request.user)
        # print(completed_task_objs)
        return render(request, "deshbord.html", {'pending_tasks': pending_tasks, 'completed_tasks': completed_task_objs})
       
    else:
        return redirect('/login/')


def deshbordcpy(request):
    if str(request.user) != "AnonymousUser" :
        pending_tasks = pending_task.objects.filter(
            pending_task_user=request.user)
        completed_task_objs_completed = completed_task.objects.filter(completed_task_user=request.user , status="success")
        completed_task_objs_expired = completed_task.objects.filter(
            completed_task_user=request.user , status="expired")
        completed_task_objs_cancelled = completed_task.objects.filter(
            completed_task_user=request.user , status="cancelled" )
        user_connections_obj = user_connections.objects.filter(Q(user = request.user) | Q(connection = request.user) )
        print(user_connections_obj)
        return render(request, "deshbordcpy.html", {'pending_tasks': pending_tasks, 'completed_task_objs_completed': completed_task_objs_completed , "completed_task_objs_expired" : completed_task_objs_expired , "completed_task_objs_cancelled" : completed_task_objs_cancelled , "user_connections" : user_connections_obj } )
    else:
        return redirect('/login/')


@csrf_exempt
def payment(request):
    if str(request.user) != "AnonymousUser": 
        if request.method == 'POST':
            print(request.POST)
            if request.FILES['image'] and request.POST['address'] and request.POST['full_name'] and request.POST['pincode'] and request.POST['deadline'] and request.POST['gmaplink'] and request.POST['mobile_number']:
                task_obj , _ = task_detail.objects.get_or_create(address=request.POST['address'], image=request.FILES['image'], user=request.user, name=request.POST['full_name'],
                                                    pincode=request.POST['pincode'], mobile_number=request.POST['mobile_number'], deadline=request.POST['deadline'], 
                                                    gmaplink=request.POST['gmaplink'] , gender=request.POST['gender'])
                if 'proof' in request.FILES.keys():
                    task_obj.proof = request.FILES['proof']
                if 'document' in request.FILES.keys():
                    task_obj.document = request.FILES['document']
                if 'note' in request.POST.keys():
                    task_obj.note = request.POST['note']

                task_obj.save()

                param_dict = {

                    'MID': 'merchant id',
                    'ORDER_ID': str(task_obj.id).rjust(20 , "0"),
                    'TXN_AMOUNT': str(500),
                    'CUST_ID': request.user.email,
                    'INDUSTRY_TYPE_ID': 'Retail',
                    'WEBSITE': 'DIYtestingweb',
                    'CHANNEL_ID': 'WEB',
                    'CALLBACK_URL': 'http://127.0.0.1:8000/paytm_payget/',
                }
                param_dict['CHECKSUMHASH'] = Checksum.generate_checksum(
                    param_dict, MERCHANT_KEY)
                return render(request, "payment.html", {"payment_obj": task_obj.payment_info, 'param_dict': param_dict})
            else:
                return redirect("/dashboard")
        else:
            return render(request, "deshbord.html")
        
    else:
        return redirect('/login/')


@csrf_exempt
def paytm_payget(request):
    if request.method == "POST":
        form = request.POST
        response_dict = {}
        for i in form.keys():
            response_dict[i] = form[i]
            if i == 'CHECKSUMHASH':
                checksumx = form[i]

        verify = Checksum.verify_checksum(
            response_dict, MERCHANT_KEY, checksumx)
        if verify:
            task_obj = task_detail.objects.get(
                id=int(response_dict['ORDERID'].lstrip("0")),)
            payment_obj = task_obj.payment_info
            if response_dict['RESPCODE'] == '01':
                print('order successful')
                payment_obj.user_payment_status = "success"
                payment_obj.user_payment_cause = response_dict['RESPMSG']
            else:
                print('order was not successful because' +
                      response_dict['RESPMSG'])
                payment_obj.user_payment_status = "fail"
                payment_obj.user_payment_cause = response_dict['RESPMSG']
            print(response_dict)
            payment_obj.user_gatewayname = response_dict['GATEWAYNAME']
            payment_obj.user_bankname = response_dict['BANKNAME']
            payment_obj.user_paymentmode = response_dict['PAYMENTMODE']
            payment_obj.user_txnid = response_dict['TXNID']
            payment_obj.user_orderid = response_dict['ORDERID']
            payment_obj.user_banktxnid = response_dict['BANKTXNID']
            payment_obj.user_txndate = response_dict['TXNDATE']
            payment_obj.save()
        return render(request, 'payment_status.html', {'response': response_dict})
    else:
        return redirect('/')


def work_bord(request):
    if str(request.user) != "AnonymousUser": 
        if request.user.extended_user_details.role == "agent":
            pand_obj = pending_task.objects.filter(
                task_detail_link__pincode=request.user.extended_user_details.pincode, status="initilize")
            pand_accepted_obj = pending_task.objects.filter(
                pending_task_agent=request.user, status="accepted")
            return render(request, "work_bord.html", {"pand_obj": pand_obj, "pand_accepted_obj": pand_accepted_obj})
        else:
            return redirect('/')
    else:
        return redirect("/login/")


def work_bordcpy(request):
    if str(request.user) != "AnonymousUser": 
        if request.user.extended_user_details.role == "agent":
            pand_obj = pending_task.objects.filter(
                task_detail_link__pincode=request.user.extended_user_details.pincode, status="initilize")
            pand_accepted_obj = pending_task.objects.filter(
                pending_task_agent=request.user, status="accepted").exclude(pending_task_user=request.user)
            completed_task_objs_completed = completed_task.objects.filter(completed_task_agent=request.user , accepted="accepted" , status = "success")
            completed_task_objs_expired = completed_task.objects.filter(completed_task_agent=request.user , accepted="accepted" , status = "expired")
            user_connections_obj = user_connections.objects.filter(Q(user = request.user) | Q(connection = request.user) )
            print(user_connections_obj)
            return render(request, "work_bordcpy.html", {"pand_obj": pand_obj, "pand_accepted_obj": pand_accepted_obj , "completed_task_objs_completed" : completed_task_objs_completed , "completed_task_objs_expired" : completed_task_objs_expired , "user_connections" : user_connections_obj})
        else:
            return redirect('/')
    else:
        return redirect("/login/")
