from background_task import background
from .models import *
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

ch_ly = get_channel_layer()

@background(schedule=7)
def notify(pending_id):
    pending = pending_task.objects.get(id=int(pending_id))
    async_to_sync(ch_ly.group_send)(
                    f"grp_{pending.task_detail_link.pincode}",
                    {
                        'type': 'sendevent',
                        'typex' : 'notification',
                        'pending_id': pending.id,
                        'image': str(pending.task_detail_link.image),
                        'name': pending.task_detail_link.name,
                        'address': pending.task_detail_link.address,
                        'pincode': pending.task_detail_link.pincode,
                        'deadline': pending.task_detail_link.deadline,
                        'gmaplink': pending.task_detail_link.gmaplink,
                    }
                )
    owner = online.objects.filter(user = pending.pending_task_user , state="user")  # check if that user is online or not 
    if len(owner) > 0 : #this true if user found in online table
        owner = owner.first() 
        if len(owner.channel_name) > 0:
            async_to_sync(ch_ly.send)(
                owner.channel_name,
                {
                    'type': 'sendevent',
                    'typex' : 'notification',
                    'pending_id': pending.id,
                    'task_name': pending.task_detail_link.name,
                    # 'payment_status': pending.payment.user_payment_status,
                    # 'task_status': pending.status,
                    # 'deadline': pending.task_detail_link.deadline,
                }
            )

@background(schedule=3600)
def expire_task(user_id , pending_id):
    event = {
        'type':'sendevent',
        'typex' : 'expire',
    }
    ch_ly = get_channel_layer()
    pending_task_obj = pending_task.objects.filter(id=int(pending_id))
    if len(pending_task_obj) > 0 :  # this is here because whene task completed before time then task obj deleted from pending task before
                                        # this expire task execution and this cause exception .
        pending_task_obj = pending_task_obj.first()
        completed_obj , _ =  completed_task.objects.get_or_create(payment = pending_task_obj.payment , task_detail_link=pending_task_obj.task_detail_link , completed_task_agent=pending_task_obj.pending_task_agent , completed_task_user=pending_task_obj.pending_task_user,refund_status = "pending",status = "expired"  , accepted=pending_task_obj.status , accept_time=pending_task_obj.accept_time)
        event['pending_id'] = pending_task_obj.id
        if pending_task_obj.status == "initilize": # means no one yet accepted this pending task
            print("initilize expire")
            refund_obj = refund_detail.objects.create(refund_amount = int(pending_task_obj.payment.user_payment))

            async_to_sync(ch_ly.group_send)(
                    f"grp_{pending_task_obj.task_detail_link.pincode}",
                    {
                        'type': 'sendevent',
                        'typex' : 'expire',
                        'pending_id': pending_task_obj.id
                    }
                )


            # print()extended_user_details.user_channel_name

        else: #this executes only when task ex expired and it wes excepted by agent
            print("accepted expire")
            refund_obj = refund_detail.objects.create(refund_amount = int(pending_task_obj.payment.user_payment))
            completed_obj.completed_task_agent=pending_task_obj.pending_task_agent

            agent = online.objects.filter(user = pending_task_obj.pending_task_agent , state="agent")  # check if that user is online or not 
            if len(agent) > 0 : #this true if user found in online table
                agent = agent.first() 
                if len(agent.channel_name) > 0:
                    async_to_sync(ch_ly.send)(
                        agent.channel_name,
                        {
                            'type': 'sendevent',
                            'typex' : 'expire_accepted',
                            'pending_id': pending_task_obj.id,
                            "task_id":completed_obj.task_detail_link.id,
                            "image" : str( completed_obj.task_detail_link.image),
                            "name" : completed_obj.task_detail_link.name,
                            "gender" : completed_obj.task_detail_link.gender,
                            "user_mobile" : completed_obj.completed_task_user.extended_user_details.mobile_number,
                            "payment_status" : completed_obj.payment.agent_payment_status
                        }
                        )


        completed_obj.refund_detail = refund_obj
        completed_obj.save()
        event['task_id'] = completed_obj.task_detail_link.id
        event['task_name'] = completed_obj.task_detail_link.name
        event['image'] = str(completed_obj.task_detail_link.image)
        event['gender'] = completed_obj.task_detail_link.gender
        event['mobile_number'] = completed_obj.task_detail_link.mobile_number
        event['accepted'] = completed_obj.accepted

        channel_name = online.objects.filter(user = User.objects.filter(id = user_id).first() ,state="user")
        if len(channel_name) > 0 :
            channel_name = channel_name.first().channel_name
            if len(channel_name) > 0:
                async_to_sync(ch_ly.send)(
                    channel_name,
                    event
                    )
        pending_task_obj.delete()
    

    # ttBDRDzpX63tcUciMrH7KCx6wBXhFrNfODVsHBYOLZyhNLE1wbs6wR4B4cxHlNvU
    # https://www.freemaptools.com/find-indian-pincodes-inside-radius.htm
    # https://www.codeproject.com/Questions/693159/Getting-all-Zip-Codes-in-a-given-Radius-km-from-gi
