from django.views.decorators.csrf import csrf_exempt , csrf_protect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import redirect
from rest_framework.parsers import JSONParser , FormParser , MultiPartParser
from rest_framework.decorators import parser_classes
from .models import *
from django.contrib.auth import login, logout , authenticate
from datetime import datetime
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models import Q
import random
import string


import smtplib
import ssl
from email.message import EmailMessage
from django.conf import settings


from background_task.models import Task

ch_ly = get_channel_layer()


def send_mail(email=""):
    # try:    
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(settings.EMAIL_ADDRESS, settings.EMAIL_PASSWORD )
        msg = EmailMessage()
        msg['Subject'] = "locallease Verification Process.."
        msg['From'] = "chachamehta33@gmail.com"
        msg['to'] = email
        msg.add_alternative(str("""this is reset link"""))
    server.send_message(msg)
    return 0
    # except:
    #     return 1


@csrf_protect
@login_required
def new_ac_find(request):
    if request.method == "POST":
        data = JSONParser().parse(request)
        if data["query_str"] != "":
            user_object_list = User.objects.filter( Q(username__startswith = data["query_str"]) | Q(first_name__startswith = data["query_str"]) | Q(last_name__startswith = data["query_str"]) | Q(email__startswith = data["query_str"]) | Q(email__contains = data["query_str"]) | Q(extended_user_details__pincode__startswith = data["query_str"]) )
            user_data = []
            for user_obj in user_object_list:
                user_name = ""
                is_online = 0
                if user_obj.first_name == "":
                    user_name = user_obj.username
                else:
                    user_name = f"{user_obj.first_name} {user_obj.last_name}"
                online_user_list = message_user_state.objects.filter(user = user_obj)
                if len(online_user_list) > 0:
                    is_online = 1
                

                data = {
                    "id" : user_obj.id,
                    "fullname" : user_name,
                    "username" : user_obj.username,
                    "image" : str(user_obj.extended_user_details.image),
                    "pincode" : user_obj.extended_user_details.pincode,
                    "is_online" : is_online
                }
                user_data.append(data)
            
            return JsonResponse({"cause": "", "data": user_data, "code": 200, "detail": "query resolved successful"}, safe=False)
        else:
            return JsonResponse({"cause": "", "data": "", "code": 404, "detail": "please fill data"}, safe=False)
    else:
        return JsonResponse({"cause": "", "data": "", "code": 405, "detail": "invalid method"}, safe=False)

    online_users = []
    # for connect in connections_obj:
    #     user_data = {

    #     }
    #     if connect.user == self.scope["user"]:
    #         message_stat_obj = message_user_state.objects.filter(user = connect.connection)
    #         if message_stat_obj.count() >= 1:
    #             message_stat_obj = message_stat_obj.last()
    #     else:
    #         message_stat_obj = message_user_state.objects.filter(user = connect.user)
    #         if message_stat_obj.count() >= 1:
    #             message_stat_obj = message_stat_obj.last()
    #             async_to_sync(chly.send)(
    #                 message_stat_obj.channel_name,
    #                 {
    #                     'type': 'sendevent_message',
    #                     'typex' : 'connection_state',
    #                     'state' : 1,
    #                     'connection_id' : str(self.scope["user"].id)
    #                 }
    #             )
    #             online_users.append(message_stat_obj.user.id)

    #     online_users.append({
    #         "image":str() 
    #     })



@csrf_protect
@login_required
def task_payment(request):
    if request.method == 'POST':
        data = JSONParser().parse(request)
        payment_obj = payment_info.objects.filter(id = int(data["payment_id"]) )[0]
        payment_obj.user_payment_status = ".."
        payment_obj.save()
        return JsonResponse({"cause": "", "data":"successfull payment", "code": 200, "detail": "operation successful"}, safe=False)
    else:
        return JsonResponse({"cause": "invalid method", "data": "", "code": 405, "detail": "use POST method"}, safe=False)
    

@csrf_protect
def log_in(request):
    if request.method == "POST":
        data = JSONParser().parse(request)
        username = data['username']
        password = data['password']
        if data['username'] and data['password']:
            user = authenticate(username=data[
                'username'], password=data['password'])
            if user:
                login(request, user)
                return JsonResponse({"cause": "", "data":"", "code": 200, "detail": "successful login"}, safe=False)
            else:
                return JsonResponse({"cause": "invalid creadential", "data": "", "code": 404, "detail": "user not found"}, safe=False)
        else:
            return JsonResponse({"cause": "", "data": "", "code": 406, "detail": "please fill valid data"}, safe=False)
        
    else:
        return JsonResponse({"cause": "invalid method", "data": "", "code": 405, "detail": "use POST method"}, safe=False)
@csrf_protect
def forgot_pass(request):
    if request.method == "POST":
        data = JSONParser().parse(request)
        email = data['email']
        if email:
            user = User.objects.filter(email=email)
            if len(user) == 1:
                print(send_mail(user[0].email))
                return JsonResponse({"cause": "", "data":"", "code": 200, "detail": "successful login"}, safe=False)
            else:
                return JsonResponse({"cause": "invalid creadential", "data": "", "code": 404, "detail": "user not found"}, safe=False)
        else:
            return JsonResponse({"cause": "", "data": "", "code": 406, "detail": "please fill valid data"}, safe=False)
        
    else:
        return JsonResponse({"cause": "invalid method", "data": "", "code": 405, "detail": "use POST method"}, safe=False)

@csrf_protect
def signup(request):
    if request.method == "POST":
        data = JSONParser().parse(request)
        username = data['username']
        password = data['password']
        email = data['email']
        mobile = data['mobile']
        address = data['address']
        pincode = data['pincode']
        if username and password and email and mobile and address and pincode:
            user_obj = User.objects.filter(username = username)
            if len(user_obj) > 0:
                return JsonResponse({"cause": "invalid creadential", "data": "", "code": 404, "detail": "username already exist"}, safe=False)
            else:
                user_obj = User.objects.create(username=username , email=email)
                user_obj.set_password(password)
                user_obj.save()
                exnted_obj = extended_user_details.objects.get(user = user_obj)
                exnted_obj.address = address
                exnted_obj.pincode = pincode
                exnted_obj.mobile_number = mobile
                exnted_obj.save()
                return JsonResponse({"cause": "", "data":"", "code": 200, "detail": "successful signup"}, safe=False)
        else:
            return JsonResponse({"cause": "", "data": "", "code": 406, "detail": "please fill valid data"}, safe=False)
    else:
        return JsonResponse({"cause": "invalid method", "data": "", "code": 405, "detail": "use POST method"}, safe=False)

@csrf_protect
@login_required
def log_out(request):
    if request.method == "POST":
        if str(request.user) != "AnonymousUser":
            logout(request)
            return JsonResponse({"cause": "", "data": "", "code": 200, "detail": "logout successfull"}, safe=False)
        else:
            return JsonResponse({"cause": "", "data": "", "code": 404, "detail": "please login first"}, safe=False)
    else:
        return JsonResponse({"cause": "", "data": "", "code": 405, "detail": "use POST method"}, safe=False)


@csrf_protect
@login_required
def accept_task(request):
    if request.method == "POST":
        data = JSONParser().parse(request)
        pending_task_obj = pending_task.objects.get(id = int(data['pending_id']))
        pending_task_obj.pending_task_agent = request.user
        pending_task_obj.status="accepted"
        pending_task_obj.accept_time =datetime.now()
        pending_task_obj.agent_location = data['agent_location']
        pending_task_obj.save()
        return JsonResponse({"cause": "", "data": "", "code": 200, "detail": "use POST method"}, safe=False)
    else:
        return JsonResponse({"cause": "", "data": "", "code": 405, "detail": "use POST method"}, safe=False)




@csrf_protect
@login_required
def complete_task(request):
    if request.method == "POST":
        data = JSONParser().parse(request)
        pending_task_obj = pending_task.objects.filter(id = int(data['pending_id'])).first()
        pandin_id = pending_task_obj.id
        otp = data['otp']
        print(f"complete otp : {pending_task_obj.otp}")
        if pending_task_obj.otp == otp:
            payment_info_obj = pending_task_obj.payment
            payment_info_obj.agent_payment_status = "success"
            payment_info_obj.save()
            print(payment_info_obj)
            return JsonResponse({"cause": "", "data": {'pending_id' : pandin_id}, "code": 200, "detail": "task_completed"}, safe=False)
        else:
            return JsonResponse({"cause": "", "data": "", "code":400, "detail": "invalid otp"}, safe=False)
    else:
        return JsonResponse({"cause": "", "data": "", "code": 405, "detail": "use POST method"}, safe=False)

@csrf_protect
@login_required
def cancel_task(request):
    if request.method == "POST":
        data = JSONParser().parse(request, request)
        print(data)
        pending_task_obj = pending_task.objects.filter(id = int(data["pending_id"])).first()
        if pending_task_obj.pending_task_user == request.user:
            pending_id = pending_task_obj.id
            completed_task_obj = completed_task.objects.create(payment = pending_task_obj.payment , task_detail_link=pending_task_obj.task_detail_link , completed_task_user=pending_task_obj.pending_task_user , status="cancelled",refund_status= "pending" , accepted=pending_task_obj.status , accept_time=pending_task_obj.accept_time)
            if pending_task_obj.status == "accepted":
                completed_task_obj.completed_task_agent=pending_task_obj.pending_task_agent

                # here one thing to add when whole project is ready and no other work is left behind
                # work : "int(pending_task_obj.payment.user_payment)*0.7" this refund amount can be vary by the time left to touch the deadline of the task
                refund_obj = refund_detail.objects.create(refund_amount = int(pending_task_obj.payment.user_payment)*0.7)
            elif pending_task_obj.status == "initilize":
                refund_obj = refund_detail.objects.create(refund_amount = int(pending_task_obj.payment.user_payment))
            completed_task_obj.refund_detail = refund_obj
            completed_task_obj.save()
            btask_obj = Task.objects.get(id = int(pending_task_obj.task_expire_id))
            btask_obj.delete()
            pending_task_obj.delete()
            # refund_user()call function when this refund function is ready
            return JsonResponse({"cause" : "" , "data" : {"pending_id" : pending_id} , "code" : 200 , "detail" : "task cancelletion successful"})
        else:
            return JsonResponse({"cause" : "" , "data" : "" , "code" : 400 , "detail" : "You are unauthorized to cancel task"})
    else:
        return JsonResponse({"cause" : "" , "data" : "" , "code" : 405 , "detail" : "Invalid Method."})


@csrf_protect
@login_required
def agent_cancel_task(request):
    if request.method == "POST":
        data = JSONParser().parse(request, request)
        print(data)
        pending_task_obj = pending_task.objects.filter(id = int(data["pending_id"])).first()
        if pending_task_obj.pending_task_agent == request.user:
            print(pending_task_obj.otp)
            if pending_task_obj.otp_cancel == data['otp']:
                agent = online.objects.filter(user = pending_task_obj.pending_task_agent , state="agent")  # check if that user is online or not 
                if len(agent) > 0 :  #this true if user found in online table
                    agent = agent.first() 
                    if len(agent.channel_name) > 0:
                        async_to_sync(ch_ly.send)(
                            agent.channel_name,
                            {
                                'type': 'sendevent',
                                'typex' : 'remove_accepted_task',
                                'pending_id': pending_task_obj.id,
                            }
                        )
                owner = online.objects.filter(user = pending_task_obj.pending_task_user , state="user")  # check if that user is online or not 
                if len(owner) > 0 :  #this true if user found in online table
                    owner = owner.first() 
                    if len(owner.channel_name) > 0:
                        async_to_sync(ch_ly.send)(
                            owner.channel_name,
                            {
                                'type': 'sendevent',
                                'typex' : 'remove_accepted_task',
                                'pending_id': pending_task_obj.id,
                            }
                        )
                pending_task_obj.pending_task_agent = None
                pending_task_obj.status = "initilize"
                pending_task_obj.agent_location = ""
                pending_task_obj.accept_time = None
                pending_task_obj.save()
                return JsonResponse({"cause" : "" , "data" : "" , "code" : 200 , "detail" : "task cancelletion successful"})
            else:
                return JsonResponse({"cause" : "" , "data" : "" , "code" : 400 , "detail" : "Invalid otp"})
        else:
            return JsonResponse({"cause" : "" , "data" : "" , "code" : 401 , "detail" : "You are unauthorized to cancel task"})
    else:
        return JsonResponse({"cause" : "" , "data" : "" , "code" : 405 , "detail" : "Invalid Method."})




@csrf_protect
@login_required
def remove_agent(request):
    if request.method == "POST":
        data = JSONParser().parse(request)
        print(f"received id {int(data['pending_id'])}")
        pending_task_obj = pending_task.objects.filter(id = int(data['pending_id'])).first()
        agent_name = pending_task_obj.pending_task_agent.username

        agent = online.objects.filter(user = pending_task_obj.pending_task_agent , state="agent")  # check if that user is online or not 
        if len(agent) > 0 :  #this true if user found in online table
            agent = agent.first() 
            if len(agent.channel_name) > 0:
                async_to_sync(ch_ly.send)(
                    agent.channel_name,
                    {
                        'type': 'sendevent',
                        'typex' : 'remove_accepted_task',
                        'pending_id': pending_task_obj.id,
                    }
                )

        pending_task_obj.pending_task_agent = None
        pending_task_obj.status = "initilize"
        pending_task_obj.agent_location = ""
        pending_task_obj.accept_time = None
        pending_task_obj.save()
        print(f"sended id {pending_task_obj.id}")
        return JsonResponse({"cause": "", "data": {"agent_name":agent_name,"task_name":pending_task_obj.task_detail_link.name , "pending_id" : pending_task_obj.id }, "code": 200, "detail": "agent removed successfully"}, safe=False)
    else:
        return JsonResponse({"cause": "", "data": "", "code": 405, "detail": "use POST method"}, safe=False)


@csrf_protect
@login_required
def generate_otp(request):
    if request.method == "POST":
        data = JSONParser().parse(request)
        print(f"received id {int(data['pending_id'])}")
        pending_task_obj = pending_task.objects.filter(id = int(data['pending_id'])).first()
        code = ''.join(random.SystemRandom().choice(
                                    string.ascii_letters + string.digits) for _ in range(7))
        code_cancel = ''.join(random.SystemRandom().choice(
                                    string.ascii_letters + string.digits) for _ in range(7))
        pending_task_obj.otp = code
        pending_task_obj.otp_cancel = code_cancel
        pending_task_obj.save()
        return JsonResponse({"cause": "", "data": {"otp" : code , "otp_cancel_agent" : code_cancel , "pending_id" : pending_task_obj.id}, "code": 200, "detail": "otp generated successful"}, safe=False)
    else:
        return JsonResponse({"cause": "", "data": "", "code": 405, "detail": "use POST method"}, safe=False)


@csrf_protect
@login_required
def get_more_details(request):
    print(request.headers)
    if request.method == "POST":
        data = JSONParser().parse(request)
        pending_task_obj = pending_task.objects.filter(id = int(data['pending_id'])).first()
        data = {
        'pending_id' : pending_task_obj.id,
        'name' : pending_task_obj.task_detail_link.name,
        'gender' : pending_task_obj.task_detail_link.gender,
        'address' : pending_task_obj.task_detail_link.address,
        'pincode' : pending_task_obj.task_detail_link.pincode,
        'mobile_number' : pending_task_obj.task_detail_link.mobile_number,
        'deadline' : pending_task_obj.task_detail_link.deadline,
        'gmaplink' : pending_task_obj.task_detail_link.gmaplink,
        'note' : pending_task_obj.task_detail_link.note,
        'image' : str(pending_task_obj.task_detail_link.image),
        'proof' : str(pending_task_obj.task_detail_link.proof),
        'document' : str(pending_task_obj.task_detail_link.document),
        "accepted" : 0,
        }
        if pending_task_obj.pending_task_user == request.user:
            data['payment_status'] = pending_task_obj.payment.user_payment_status
            data['user_bankname'] = pending_task_obj.payment.user_bankname
            data['user_paymentmode'] = pending_task_obj.payment.user_paymentmode
            data['user_txnid'] = pending_task_obj.payment.user_txnid
            data['user_txndate'] = pending_task_obj.payment.user_txndate

        if pending_task_obj.status == "accepted" and pending_task_obj.pending_task_user == request.user:
            data["accepted"] = 1
            data["agent_name"] = pending_task_obj.pending_task_agent.username
            data["accepted_time"] = pending_task_obj.accept_time
            data["agent_mobile"] = pending_task_obj.pending_task_agent.extended_user_details.mobile_number
            data["agent_image"] = str(pending_task_obj.pending_task_agent.extended_user_details.image)
            data["agent_xender"] = str(pending_task_obj.pending_task_agent.extended_user_details.xender)
            data["agent_location"] = str(pending_task_obj.agent_location)

        elif pending_task_obj.status == "accepted" and pending_task_obj.pending_task_agent == request.user:
            data["accepted"] = 1
            data["accepted_time"] = pending_task_obj.accept_time
            data["user_name"] = pending_task_obj.pending_task_user.username
            data["user_mobile"] = pending_task_obj.pending_task_user.extended_user_details.mobile_number
            data["user_image"] = str(pending_task_obj.pending_task_user.extended_user_details.image)
            data["user_xender"] = str(pending_task_obj.pending_task_user.extended_user_details.xender)

        return JsonResponse({"cause": "", "data": data, "code": 200, "detail": "more details grabed."}, safe=False)
    else:
        return JsonResponse({"cause": "", "data": "", "code": 405, "detail": "use POST method"}, safe=False)


@csrf_protect
@login_required
def complete_task_more_details(request):
    if request.method == "POST":
        data = JSONParser().parse(request)
        completed_task_obj = task_detail.objects.filter(id=data['task_id']).first().completed_task
        data = {
        'pending_id' : completed_task_obj.task_detail_link.id,
        'name' : completed_task_obj.task_detail_link.name,
        'gender' : completed_task_obj.task_detail_link.gender,
        'address' : completed_task_obj.task_detail_link.address,
        'pincode' : completed_task_obj.task_detail_link.pincode,
        'deadline' : completed_task_obj.task_detail_link.deadline,
        'completed_time' : completed_task_obj.date,
        'image' : str(completed_task_obj.task_detail_link.image),
        "accepted" : 0,
        'gmaplink' : completed_task_obj.task_detail_link.gmaplink,
        }
        if completed_task_obj.completed_task_user == request.user:
            data['document'] = str(completed_task_obj.task_detail_link.document)
            data['proof'] = str(completed_task_obj.task_detail_link.proof)
            data['note'] = completed_task_obj.task_detail_link.note
            data['mobile_number'] = completed_task_obj.task_detail_link.mobile_number
            data['payment_status'] = completed_task_obj.payment.user_payment_status
            data['user_bankname'] = completed_task_obj.payment.user_bankname
            data['user_paymentmode'] = completed_task_obj.payment.user_paymentmode
            data['user_txnid'] = completed_task_obj.payment.user_txnid
            data['user_txndate'] = completed_task_obj.payment.user_txndate
        # else:
        #     data['document'] = "..."
        #     data['proof'] = "..."
        #     data['note'] = "..."
        #     data['mobile_number'] = "..."


        if completed_task_obj.accepted == "accepted" and completed_task_obj.completed_task_user == request.user:
            data["accepted"] = 1
            data["agent_name"] = completed_task_obj.completed_task_agent.username
            data["accepted_time"] = completed_task_obj.accept_time
            data["agent_mobile"] = completed_task_obj.completed_task_agent.extended_user_details.mobile_number
            data["agent_image"] = str(completed_task_obj.completed_task_agent.extended_user_details.image)
            data["agent_xender"] = str(completed_task_obj.completed_task_agent.extended_user_details.xender)
            # data["agent_location"] = "/#"

        elif completed_task_obj.accepted == "accepted" and completed_task_obj.completed_task_agent == request.user:
            data["accepted"] = 1
            data["accepted_time"] = completed_task_obj.accept_time
            data["user_name"] = completed_task_obj.completed_task_user.username
            data["user_image"] = str(completed_task_obj.completed_task_user.extended_user_details.image)
            data["user_mobile"] = completed_task_obj.completed_task_user.extended_user_details.mobile_number
            data["user_gender"] = completed_task_obj.completed_task_user.extended_user_details.xender
            data["agent_payment_status"] = completed_task_obj.payment.agent_payment_status

        return JsonResponse({"cause": "", "data": data, "code": 200, "detail": " completed task details grabed."}, safe=True)
    else:
        return JsonResponse({"cause": "", "data": "", "code": 405, "detail": "use POST method"}, safe=False)

@csrf_protect
@login_required
def delete_task(request):
    if request.method == "POST":
        data = JSONParser().parse(request)
        task_obj = task_detail.objects.filter(id = int(data['task_id'])).first()
        task_obj.delete()
        return JsonResponse({"cause": "", "data": "", "code": 200, "detail": "use POST method"}, safe=False)
    else:
        return JsonResponse({"cause": "", "data": "", "code": 405, "detail": "use POST method"}, safe=False)

@csrf_protect
def contact_us(request):
    if request.method == "POST":
        data = JSONParser().parse(request)
        print(data)
        # contactobj = contactus.objects.create(first_name=data['first_name'] , last_name= data['last_name'] , email_address=data['email_address'] , mobile_number=data['mobile_number'] , message=data['message'])
        # contactobj.save()
        return JsonResponse({"cause": "", "data": "", "code": 200, "detail": "contact recorded successful"}, safe=False)
    else:
        return JsonResponse({"cause": "", "data": "", "code": 405, "detail": "use POST method"}, safe=False)


@csrf_protect
@login_required
@parser_classes([JSONParser, FormParser, MultiPartParser])
def update_user_profile_img(request):
    if(request.method == "POST"):
        ext_obj = request.user.extended_user_details
        ext_obj.image = request.FILES['updated_profile_img']
        ext_obj.save()
        return JsonResponse({"cause": "", "data": {'img_url' : str(ext_obj.image)}, "code": 200, "detail": "profile image updated successfully"}, safe=False)
    else:
        return JsonResponse({"cause": "", "data": "", "code": 405, "detail": "use POST method"}, safe=False)

@csrf_protect
@login_required
def update_user_profile(request):
    if(request.method == "POST"):
        data = JSONParser().parse(request)
        user_obj = request.user
        ext_obj = request.user.extended_user_details
        if 'fname' in data:
            user_obj.first_name = data['fname']
        if 'lname' in data:
            user_obj.last_name = data['lname']
        if 'email' in data:
            user_obj.email = data['email']
        if 'mobile' in data:
            ext_obj.mobile_number = data['mobile']
        if 'address' in data:
            ext_obj.address = data['address']
        if 'pincode' in data:
            ext_obj.pincode = data['pincode']
        
        user_obj.save()
        ext_obj.save()
        return JsonResponse({"cause": "", "data": "", "code": 200, "detail": "profile updated successfully"}, safe=False)
    else:
        return JsonResponse({"cause": "", "data": "", "code": 405, "detail": "use POST method"}, safe=False)

@csrf_protect
@login_required
@parser_classes([JSONParser, FormParser, MultiPartParser])
def update_task(request):
    if(request.method == "POST"):
        print(request.POST)
        task_detail_obj = pending_task.objects.get(id=int(request.POST['id'])).task_detail_link
        task_detail_obj.mobile_number = int(request.POST['update_task_mobile'])
        task_detail_obj.deadline = request.POST['update_task_deadline']
        task_detail_obj.address = request.POST['update_task_address']
        task_detail_obj.gmaplink = request.POST['update_task_gmap']
        task_detail_obj.note = request.POST['update_task_note']
        if "update_profile_img" in request.FILES:
            task_detail_obj.image = request.FILES['update_profile_img']
        if "update_task_proof" in request.FILES:
            task_detail_obj.image = request.FILES['update_task_proof']
        if "update_task_document" in request.FILES:
            task_detail_obj.image = request.FILES['update_task_document']

        task_detail_obj.save()
        return JsonResponse({"cause": "", "data": {"id": task_detail_obj.pending_task.id}, "code": 200, "detail": "update task successful"}, safe=False)
    else:
        return JsonResponse({"cause": "", "data": "", "code": 405, "detail": "use POST method"}, safe=False)
