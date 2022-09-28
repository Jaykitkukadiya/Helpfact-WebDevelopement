import json

from django.db.models.signals import pre_save , post_save
from django.dispatch import receiver
from .models import *
from .crone_job import *
import random
import string
from datetime import datetime
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import time
from background_task.models import Task


ch_ly = get_channel_layer()



@receiver(post_save, sender=User)
def user_trigger(sender, instance, created, **kwargs):
    if created:
        ext_obj = extended_user_details.objects.create(user = instance)
        ext_obj.save()


@receiver(post_save, sender=task_detail)
def task_detail_triggers(sender, instance, created, **kwargs):
    if created:
        print("task created")
        payment_info.objects.create(task_detail_link=instance , user= instance.user , user_payment= 500 , agent_payment=200 )
    else:
        try:
            updated_fields = list(kwargs.get("update_fields"))
            data = {}
            for field_name in updated_fields:
                data[field_name] = str(getattr(instance , field_name))
            if "image" in updated_fields or "proof" in updated_fields or "document" in updated_fields or "mobile_number" in updated_fields or "deadline" in updated_fields or "address" in updated_fields or "gmaplink" in updated_fields or "note" in updated_fields:
                if "deadline" in updated_fields:
                    taskobj = Task.objects.filter(id = int(instance.pending_task.task_expire_id))
                    taskobj.delete()
                    dt_object = int(instance.deadline)/1000 - int(datetime.timestamp(datetime.now()))
                    task_expire_obj = expire_task(int(instance.user.id) ,int(instance.pending_task.id) , schedule=int(dt_object))
                    instance.pending_task.task_expire_id = task_expire_obj.id
                    instance.pending_task.save()
                if instance.pending_task.status == "initilize":
                    allagents = {}
                    if "deadline" in updated_fields:
                        allagents["deadline"] = instance.deadline
                    if "image" in updated_fields:
                        allagents['image'] = str(instance.image)
                    if "address" in updated_fields:
                        allagents['address'] = instance.address
                    if "gmaplink" in updated_fields:
                        allagents['gmap'] = instance.gmaplink
                    async_to_sync(ch_ly.group_send)(
                        f"grp_{instance.pincode}",
                        {
                            'type': 'sendevent',
                            'typex': 'updated',
                            'accepted' : 0,
                            'pending_id': instance.pending_task.id,
                            'data' : json.dumps(allagents)
                        }
                    )
                elif instance.pending_task.status == "accepted" and len(online.objects.filter(user= instance.pending_task.pending_task_agent)) > 0:
                    allagents = {}
                    if "deadline" in updated_fields:
                        allagents["deadline"] = instance.deadline
                    if "image" in updated_fields:
                        allagents['image'] = str(instance.image)
                    async_to_sync(ch_ly.send)(
                        online.objects.filter(user= instance.pending_task.pending_task_agent).first().channel_name,
                        {
                            'type': 'sendevent',
                            'typex': 'updated',
                            'accepted' : 1,
                            'pending_id': instance.pending_task.id,
                            'data': json.dumps(allagents)
                        }
                    )
                if len(online.objects.filter(user= instance.pending_task.pending_task_user)) > 0:
                    async_to_sync(ch_ly.send)(
                        online.objects.filter(user= instance.pending_task.pending_task_user).first().channel_name,
                        {
                            'type': 'sendevent',
                            'typex': 'updated',
                            'pending_id': instance.pending_task.id,
                            'data': json.dumps(data)
                        }
                    )
                print("notificationsend to agent")
        except:
            print(f"opps error in task update.")



@receiver(post_save , sender=payment_info)
def success_payment_triggers(sender , instance , created , **kwargs):
    print("task completed")
    if not created:
        updated_fields = list(kwargs.get("update_fields"))
        print(updated_fields)
        if instance.user_payment_status == "success":
            if instance.agent_payment_status == "fail":

                code = ''.join(random.SystemRandom().choice(
                                    string.ascii_letters + string.digits) for _ in range(7))
                pending = pending_task.objects.create(task_detail_link=instance.task_detail_link ,pending_task_user = instance.user , payment=instance , otp = code)

                dt_object = int(instance.task_detail_link.deadline)/1000 - int(datetime.timestamp(datetime.now()))
                task_expire_obj = expire_task(int(instance.user.id) ,int(pending.id) , schedule=int(dt_object))
                pending.task_expire_id = task_expire_obj.id
                pending.save()
            else:
                pand_obj = instance.pending_task_set.first()
                pending_id = pand_obj.id
                if pand_obj.status == "accepted": 
                    completed_task_obj = completed_task.objects.create(payment = pand_obj.payment , task_detail_link=pand_obj.task_detail_link , completed_task_agent=pand_obj.pending_task_agent , completed_task_user=pand_obj.pending_task_user , status="success" ,refund_status= "-" ,  accepted=pand_obj.status , accept_time=pand_obj.accept_time)
                    owner = online.objects.filter(user = instance.user , state="user")  # check if that user is online or not 
                    if len(owner) > 0 :  #this true if user found in online table
                        owner = owner.first() 
                        async_to_sync(ch_ly.send)(
                            owner.channel_name,
                            {
                                'type': 'sendevent',
                                'typex' : 'completed',
                                'pending_id': pending_id,
                                "image"  : str(completed_task_obj.task_detail_link.image),
                                "task_name" : completed_task_obj.task_detail_link.name,
                                "gender" : completed_task_obj.task_detail_link.gender,
                                "mobile_number" : completed_task_obj.task_detail_link.mobile_number,
                                "task_id" : completed_task_obj.task_detail_link.id,
                            }
                        )

                        # change here for now
                    agent = online.objects.filter(user = pand_obj.pending_task_agent , state="agent")  # check if that user is online or not 
                    if len(agent) > 0 : #this true if user found in online table
                        agent = agent.first() 
                        async_to_sync(ch_ly.send)(
                            agent.channel_name,
                            {
                                'type': 'sendevent',
                                'typex' : 'completed',
                                'pending_id': pand_obj.id,
                                "task_id":completed_task_obj.task_detail_link.id,
                                "image" : str(completed_task_obj.task_detail_link.image),
                                "name" : completed_task_obj.task_detail_link.name,
                                "gender" : completed_task_obj.task_detail_link.gender,
                                "user_mobile" : completed_task_obj.completed_task_user.extended_user_details.mobile_number,
                                "payment_status" : completed_task_obj.payment.agent_payment_status
                            }
                            )
                    pand_obj.delete()
                else:
                    print("not accepted")
                    instance.agent_payment_status = "fail"
                    instance.save()      
        elif instance.user_payment_status == "fail" :
            task_obj = instance.task_detail_link
            task_obj.delete()


@receiver(post_save, sender=pending_task)
def task_notification_triggers(sender, instance, created, **kwargs):
    if not created:
        updated_fields = list(kwargs.get("update_fields"))
        if (len(updated_fields) == 1 or len(updated_fields) == 2) and ("otp" in updated_fields or "otp_cancel" in updated_fields):
            print("otp changed")
        elif len(updated_fields) == 1 and "task_expire_id" in updated_fields:
            print("expire timer is set")
        else:
            if instance.status == "accepted":
                async_to_sync(ch_ly.group_send)(
                        f"grp_{instance.task_detail_link.pincode}",
                        {
                            'type': 'sendevent',
                            'typex' : 'accepted',
                            'pending_id': instance.id,
                        }
                    )
                agent = online.objects.filter(user = instance.pending_task_agent , state="agent")  # check if that user is online or not 
                if len(agent) > 0 : #this true if user found in online table
                    agent = agent.first() 
                    if len(agent.channel_name) > 0:
                        async_to_sync(ch_ly.send)(
                            agent.channel_name,
                            {
                                'type': 'sendevent',
                                'typex' : 'newtask',
                                'pending_id': instance.id,
                                'image': str(instance.task_detail_link.image),
                                'name': instance.task_detail_link.name,
                                'mobile': instance.task_detail_link.mobile_number,
                                'gmaplink': instance.task_detail_link.gmaplink,
                                'deadline': instance.task_detail_link.deadline,
                            }
                        )
                owner = online.objects.filter(user = instance.pending_task_user , state="user")  # check if that user is online or not 
                if len(owner) > 0 :  #this true if user found in online table
                    owner = owner.first() 
                    if len(owner.channel_name) > 0:
                        async_to_sync(ch_ly.send)(
                            owner.channel_name,
                            {
                                'type': 'sendevent',
                                'typex' : 'accepted',
                                'pending_id': instance.id,
                                'task_name': instance.task_detail_link.name,
                                'agent_name': instance.pending_task_agent.username,
                                'agent_mobile': instance.pending_task_agent.extended_user_details.mobile_number,
                                'agent_image': str(instance.pending_task_agent.extended_user_details.image),
                                'agent_location': instance.agent_location,
                                'accepted_time': str(instance.accept_time),
                                'agent_xender': instance.pending_task_agent.extended_user_details.xender,
                            }
                        )

            elif instance.status == "initilize":
                notify(instance.id , schedule=7)
    else:
        notify(instance.id , schedule=7)
        print("new pending task is creatd")


@receiver(post_save, sender=completed_task)
def completed_task_tregger(sender, instance, created, **kwargs):
    if not created:
        updated_fields = list(kwargs.get("update_fields"))
        if (len(updated_fields) == 1 or len(updated_fields) == 2) and ("refund_detail" in updated_fields or "completed_task_agent" in  updated_fields  ):
            print(updated_fields)
            if instance.status == "cancelled":
                if instance.accepted == "accepted":
                    print("task is accepted")
                    if len(online.objects.filter(user= instance.completed_task_agent)) > 0:
                        async_to_sync(ch_ly.send)(
                            online.objects.filter(user= instance.completed_task_agent).first().channel_name,
                            {
                                'type': 'sendevent',
                                'typex': 'cancelled',
                                'completed_id': instance.id,
                                
                            }
                        )
                print("notification to send of cancellation")
                if len(online.objects.filter(user= instance.completed_task_user)) > 0:
                    async_to_sync(ch_ly.send)(
                        online.objects.filter(user= instance.completed_task_user).first().channel_name,
                        {
                            'type': 'sendevent',
                            'typex': 'cancelled',
                            'task_id': instance.task_detail_link.id,
                            'image': str(instance.task_detail_link.image),
                            'name': instance.task_detail_link.name,
                            'mobile_number': instance.task_detail_link.mobile_number,
                            'gender': instance.task_detail_link.gender,
                            'refund_status': instance.refund_status,
                            'accepted': instance.accepted,
                        }
                    )

                async_to_sync(ch_ly.group_send)(
                    f"grp_{instance.task_detail_link.pincode}",
                    {
                        'type': 'sendevent',
                        'typex' : 'cancelled',
                        'pending_id': instance.id,
                    }
                ) 
# we further define for expired and accepted task notification here

# no meaning
# @receiver(post_save, sender=completed_task)
# def completed_task_tregger(sender, instance, created, **kwargs):
#     payment_info_obj = instance.payment
#     task_obj = instance.task_detail_link
#     if payment_info_obj.agent_payment_status == "fail":
#         pass

# @receiver(post_save, sender=task_notification)
# def task_noti_trigger(sender, instance, created, **kwargs):
#     if created:
#         print("got a new work")

@receiver(post_save, sender=contactus)
def task_noti_trigger(sender, instance, created, **kwargs):
    if not created:
        print(list(kwargs.get("update_fields")))

































# old code for ref.


# from django.db.models.signals import pre_save , post_save
# from django.dispatch import receiver
# from .models import *
# from .crone_job import *
# import random
# import string
# from datetime import datetime
# from channels.layers import get_channel_layer
# from asgiref.sync import async_to_sync
# import time

# ch_ly = get_channel_layer()

# @receiver(post_save, sender=User)
# def user_trigger(sender, instance, created, **kwargs):
#     if created:
#         ext_obj = extended_user_details.objects.create(user = instance)
#         ext_obj.save()


# @receiver(post_save, sender=task_detail)
# def task_detail_triggers(sender, instance, created, **kwargs):
#     if created:
#         payment_info.objects.create(task_detail_link=instance , user= instance.user , user_payment= 500 , agent_payment=200 )    



# @receiver(post_save , sender=payment_info)
# def success_payment_triggers(sender , instance , created , **kwargs):
#     updated_fields = list(kwargs.get("update_fields"))
#     if not created and instance.user_payment_status == "success":
#         if instance.agent_payment_status == "fail":

#             code = ''.join(random.SystemRandom().choice(
#                                 string.ascii_letters + string.digits) for _ in range(7))
#             pending , pand_created = pending_task.objects.get_or_create(task_detail_link=instance.task_detail_link ,pending_task_user = instance.user , payment=instance)
#             if pand_created:
#                 pending.otp = code
#                 pending.save()
#             else:
#                 pending.save()

#             dt_object = int(instance.task_detail_link.deadline)/1000 - int(datetime.timestamp(datetime.now()))
#             expire_task(int(instance.user.id) ,int(pending.id) , schedule=int(dt_object))
        
            

                
#         else:
#             pand_obj = instance.pending_task_set.first()
#             pending_id = pand_obj.id
#             if pand_obj.status == "accepted": 
#                 completed_task.objects.create(payment = pand_obj.payment , task_detail_link=pand_obj.task_detail_link , completed_task_agent=pand_obj.pending_task_agent , completed_task_user=pand_obj.pending_task_user , status="success")
#                 pand_obj.delete()
#                 owner = online.objects.filter(user = instance.user , state="user")  # check if that user is online or not 
#                 if len(owner) > 0 :  #this true if user found in online table
#                     owner = owner.first() 
#                     async_to_sync(ch_ly.send)(
#                         owner.channel_name,
#                         {
#                             'type': 'sendevent',
#                             'typex' : 'completed',
#                             'pending_id': pending_id,
#                             'message' : "task completed successfully. for any query contact us with task id."
#                         }
#                     )
#             else:
#                 print("not accepted")
#                 instance.agent_payment_status = "fail"
#                 instance.save()
        
            
#     elif not created and instance.user_payment_status == "fail" :
#         task_obj = instance.task_detail_link
#         task_obj.delete()


# @receiver(post_save, sender=pending_task)
# def task_notification_triggers(sender, instance, created, **kwargs):
#     if not created and instance.status == "accepted":
#         async_to_sync(ch_ly.group_send)(
#                 f"grp_{instance.task_detail_link.pincode}",
#                 {
#                     'type': 'sendevent',
#                     'typex' : 'accepted',
#                     'pending_id': instance.id,
#                 }
#             )
#         agent = online.objects.filter(user = instance.pending_task_agent , state="agent")  # check if that user is online or not 
#         if len(agent) > 0 : #this true if user found in online table
#             agent = agent.first() 
#             if len(agent.channel_name) > 0:
#                 async_to_sync(ch_ly.send)(
#                     agent.channel_name,
#                     {
#                         'type': 'sendevent',
#                         'typex' : 'newtask',
#                         'pending_id': instance.id,
#                         'image': str(instance.task_detail_link.image),
#                         'name': instance.task_detail_link.name,
#                         'mobile': instance.task_detail_link.mobile_number,
#                         'gmaplink': instance.task_detail_link.gmaplink,
#                         'deadline': instance.task_detail_link.deadline,
#                     }
#                 )
#         owner = online.objects.filter(user = instance.pending_task_user , state="user")  # check if that user is online or not 
#         if len(owner) > 0 :  #this true if user found in online table
#             owner = owner.first() 
#             if len(owner.channel_name) > 0:
#                 async_to_sync(ch_ly.send)(
#                     owner.channel_name,
#                     {
#                         'type': 'sendevent',
#                         'typex' : 'accepted',
#                         'pending_id': instance.id,
#                         'task_name': instance.task_detail_link.name,
#                         'agent_name': instance.pending_task_agent.username,
#                         'agent_mobile': instance.pending_task_agent.extended_user_details.mobile_number,
#                         'agent_image': str(instance.pending_task_agent.extended_user_details.image),
#                         'agent_location': instance.agent_location,
#                         'accepted_time': str(instance.accept_time),
#                         'agent_xender': instance.pending_task_agent.extended_user_details.xender,
#                     }
#                 )

#     elif not created and instance.status == "initilize":
#         notify(instance.id , schedule=7)



# # no meaning
# # @receiver(post_save, sender=completed_task)
# # def completed_task_tregger(sender, instance, created, **kwargs):
# #     payment_info_obj = instance.payment
# #     task_obj = instance.task_detail_link
# #     if payment_info_obj.agent_payment_status == "fail":
# #         pass

# # @receiver(post_save, sender=task_notification)
# # def task_noti_trigger(sender, instance, created, **kwargs):
# #     if created:
# #         print("got a new work")

# @receiver(post_save, sender=contactus)
# def task_noti_trigger(sender, instance, created, **kwargs):
#     if not created:
#         print(list(kwargs.get("update_fields")))









