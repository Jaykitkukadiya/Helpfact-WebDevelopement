from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
from .models import *
from channels.db import database_sync_to_async
import json
from asgiref.sync import async_to_sync ,sync_to_async
from django.contrib.auth.models import User
from django.db.models import Q

chly = get_channel_layer()

class expire(WebsocketConsumer):

    def offline(self):
        onlineobj = online.objects.all().filter(user = self.scope['user']).first()
        if onlineobj.channel_name == self.channel_name:
            onlineobj.delete()

    def connect(self):
        self.accept()
        user = self.scope["user"]
        self.group_name = 'grp_%s' % user.extended_user_details.pincode
    


    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name,
            self.channel_name
        )
        self.offline()
        self.close()
        print("socket_disconnect")


    def receive(self, text_data):
        if text_data in ["user","agent"]:
            user = self.scope["user"]
            print(text_data)

            # below code will help to use parallel screen
            
            # onlineobj , onlineobj_cre = online.objects.get_or_create(user=user , channel_name=self.channel_name , state=text_data)
            # if onlineobj_cre:
            #     onlineobj.save()
            # else:
            #     onlineobj.delete()
            #     onlineobj = online.objects.create(user=user , channel_name=self.channel_name , state=text_data)
            #     onlineobj.save()

            # below code is usefull for only one screen if other screen is opened then first not work means notifications and other will not work at same time

            if len(online.objects.filter(user = user)) > 0 :
                for online_obj in online.objects.filter(user = user):
                    online_obj.delete()
                onlineobj = online.objects.create(user=user , channel_name=self.channel_name , state=text_data)
                onlineobj.save()
            else:
                onlineobj = online.objects.create(user=user , channel_name=self.channel_name , state=text_data)
                onlineobj.save()


            if text_data == "agent":
                async_to_sync(self.channel_layer.group_add)(
                    self.group_name,
                    self.channel_name
                )
            # print(self.channel_name)
        elif text_data == "ping":
            # print(self.scope['user'])

            exist_chname = online.objects.all().filter(user = self.scope['user']).first().channel_name
            if exist_chname != self.channel_name:
                # print(online.objects.all().filter(user = self.scope['user']).first().channel_name)
                # print(self.channel_name)
                async_to_sync(self.channel_layer.send)(
                    self.channel_name,
                    {
                        'type': 'sendevent',
                        'typex' : 'session_expire',
                        'detail' : 'you are no longer available in this window'
                    }
                )

            


    def sendevent(self , event):
        # print("online")
        self.send(text_data=json.dumps(
            event
        ))
        # print("onlinefinish")



class message(WebsocketConsumer):


    def connect(self):
        self.accept()
        online_users = []
        connections_obj = user_connections.objects.filter(Q(user = self.scope["user"]) | Q(connection = self.scope["user"]) )
        for connect in connections_obj:
            if connect.user == self.scope["user"]:
                message_stat_obj = message_user_state.objects.filter(user = connect.connection)
                if message_stat_obj.count() >= 1:
                    message_stat_obj = message_stat_obj.last()
                    async_to_sync(chly.send)(
                        message_stat_obj.channel_name,
                        {
                            'type': 'sendevent_message',
                            'typex' : 'connection_state',
                            'state' : 1,
                            'connection_id' : str(self.scope["user"].id)
                        }
                    )
                    online_users.append(message_stat_obj.user.id)
            else:
                message_stat_obj = message_user_state.objects.filter(user = connect.user)
                if message_stat_obj.count() >= 1:
                    message_stat_obj = message_stat_obj.last()
                    async_to_sync(chly.send)(
                        message_stat_obj.channel_name,
                        {
                            'type': 'sendevent_message',
                            'typex' : 'connection_state',
                            'state' : 1,
                            'connection_id' : str(self.scope["user"].id)
                        }
                    )
                    online_users.append(message_stat_obj.user.id)

        async_to_sync(chly.send)(
            self.channel_name,
            {
                'type': 'sendevent_message',
                'typex' : 'initial_connection_state',
                'connection_ids' : online_users
            }
        )
    


    def disconnect(self, close_code):
        for message_user_state_obj in message_user_state.objects.filter(user = self.scope['user']):
            message_user_state_obj.delete()

        connections_obj = user_connections.objects.filter(Q(user = self.scope["user"]) | Q(connection = self.scope["user"]) )
        for connect in connections_obj:
            if connect.user == self.scope["user"]:
                message_stat_obj = message_user_state.objects.filter(user = connect.connection)
                if message_stat_obj.count() >= 1:
                    message_stat_obj = message_stat_obj.last()
                    async_to_sync(chly.send)(
                        message_stat_obj.channel_name,
                        {
                            'type': 'sendevent_message',
                            'typex' : 'connection_state',
                            'state' : 0,
                            'connection_id' : str(self.scope["user"].id)
                        }
                    )
            else:
                message_stat_obj = message_user_state.objects.filter(user = connect.user)
                if message_stat_obj.count() >= 1:
                    message_stat_obj = message_stat_obj.last()
                    async_to_sync(chly.send)(
                        message_stat_obj.channel_name,
                        {
                            'type': 'sendevent_message',
                            'typex' : 'connection_state',
                            'state' : 0,
                            'connection_id' : str(self.scope["user"].id)
                        }
                    )
        print("message_socket_disconnect")



    def receive(self, text_data):
        data = json.loads(text_data)
        if data["typex"] == "register":
            if data["user_type"] in ["user","agent"]:
                user = self.scope["user"]
                print(data["user_type"])

                if len(message_user_state.objects.filter(user = user)) > 0 :
                    for message_user_state_obj in message_user_state.objects.filter(user = user):
                        message_user_state_obj.delete()
                    message_user_state_new_obj = message_user_state.objects.create(user=user , channel_name=self.channel_name , state=data["user_type"])
                    message_user_state_new_obj.save()
                else:
                    message_user_state_obj = message_user_state.objects.create(user=user , channel_name=self.channel_name , state=data["user_type"])
                    message_user_state_obj.save()
        elif data["typex"] == "ping":

            # if data["receiver_id"] != "":
            #     if (len(message_user_state.objects.filter(user = User.objects.filter(id = int(data["receiver_id"]) ).first() ) ) > 0):
            #         async_to_sync(chly.send)(
            #             self.channel_name,
            #             {
            #                 'type': 'sendevent_message',
            #                 'typex' : 'ping',
            #                 'receiver_state' : 1
            #             }
            #         )
            #     else:
            #         async_to_sync(chly.send)(
            #             self.channel_name,
            #             {
            #                 'type': 'sendevent_message',
            #                 'typex' : 'ping',
            #                 'receiver_state' : 0
            #             }
            #         )

                    

            exist_chname = message_user_state.objects.all().filter(user = self.scope['user']).first().channel_name
            if exist_chname != self.channel_name:
                async_to_sync(self.channel_layer.send)(
                    self.channel_name,
                    {
                        'type': 'sendevent_message',
                        'typex' : 'session_expire',
                        'detail' : 'you are no longer available in this window'
                    }
                )
        else:
            if data["message_type"] == "new_mes":
                if data["receiver_id"] != "":
                    user_conn_objs =  user_connections.objects.filter(Q(user = User.objects.filter(id = int(data["user_id"])).first() , connection = User.objects.filter(id = int(data["receiver_id"])).first()) | Q(connection = User.objects.filter(id = int(data["user_id"])).first() , user = User.objects.filter(id = int(data["receiver_id"])).first()) )
                    if len(user_conn_objs) == 1:
                        user_conn_obj = user_conn_objs.first()
                        async_to_sync(chly.send)(
                            self.channel_name,
                            {
                                'type': 'sendevent_message',
                                'typex' : 'message_sent',
                                'detail' : data["message_id"]
                            }
                        )
                        mess_user_obj = message_user_state.objects.filter(user = User.objects.filter(id = int(data["receiver_id"])).first() )
                        if len(mess_user_obj) > 0:
                            mess_user_obj = mess_user_obj.first()
                            async_to_sync(self.channel_layer.send)(
                            mess_user_obj.channel_name,
                            {
                                'type': 'sendevent_message',
                                'typex' : 'new_mess_recv',
                                'detail' : json.dumps({
                                    "user_id" : data["user_id"],# sending user id
                                    "message_id": data["message_id"] ,
                                    "message" : data["message"],
                                    "time" : data["time"]
                                })
                            }
                            )
                        else:
                            pass
                    elif len(user_conn_objs) == 0:
                        user_conn_obj = user_connections.objects.create(user = User.objects.filter(id = int(data["user_id"])).first() , connection = User.objects.filter(id = int(data["receiver_id"])).first())
                        async_to_sync(chly.send)(
                            self.channel_name,
                            {
                                'type': 'sendevent_message',
                                'typex' : 'message_sent',
                                'detail' : data["message_id"],
                            }
                        )
                        mess_user_obj = message_user_state.objects.filter(user = User.objects.filter(id = int(data["receiver_id"])).first() )
                        if len(mess_user_obj) > 0:
                            mess_user_obj = mess_user_obj.first()
                            async_to_sync(self.channel_layer.send)(
                            mess_user_obj.channel_name,
                            {
                                'type': 'sendevent_message',
                                'typex' : 'new_user_mess_recv',
                                'detail' : json.dumps({
                                    "user_id" : data["user_id"],# sending user id
                                    "message_id": data["message_id"] ,
                                    "message" : data["message"],
                                    "time" : data["time"],
                                    "user_img" : str(user_conn_obj.user.extended_user_details.image),
                                    "user_pincode" : user_conn_obj.user.extended_user_details.pincode,
                                    "user_fullname" : f"{user_conn_obj.user.first_name} {user_conn_obj.user.last_name}" ,
                                    "user_name" : user_conn_obj.user.username,
                                })
                            }
                            )
                        else:
                            pass
                else:
                    async_to_sync(chly.send)(
                        self.channel_name,
                        {
                            'type': 'sendevent_message',
                            'typex' : 'invelid_data',
                            'detail' : "invalid user"
                        }
                    )


            elif data["message_type"] == "received_mes" :
                mess_user_obj = message_user_state.objects.filter(user = User.objects.filter(id = int(data["receiver_id"])).first() )
                if len(mess_user_obj) > 0:
                    mess_user_obj = mess_user_obj.first()
                    async_to_sync(self.channel_layer.send)(
                    mess_user_obj.channel_name,
                    {
                        'type': 'sendevent_message',
                        'typex' : 'received_mes',
                        'detail' : json.dumps({
                            "user_id" : data["user_id"],
                            "message_id": data["message_id"] ,
                            "receive_time" : data["receive_time"]
                        })
                    }
                    )
                else:
                    pass
            elif data["message_type"] == "viewed_mes" :
                mess_user_obj = message_user_state.objects.filter(user = User.objects.filter(id = int(data["receiver_id"])).first() )
                if len(mess_user_obj) > 0:
                    mess_user_obj = mess_user_obj.first()
                    async_to_sync(self.channel_layer.send)(
                    mess_user_obj.channel_name,
                    {
                        'type': 'sendevent_message',
                        'typex' : 'viewed_mes',
                        'detail' : json.dumps({
                            "user_id" : data["user_id"],
                            "message_id": data["message_id"] ,
                            "view_time" : data["view_time"],
                        })
                    }
                    )
                else:
                    pass
                



            


    def sendevent_message(self , event):
        # print("online")
        self.send(text_data=json.dumps(
            event
        ))
        # print("onlinefinish")
