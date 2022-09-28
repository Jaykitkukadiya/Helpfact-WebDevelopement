from django.contrib import admin
from .models import contactus,refund_detail,extended_user_details,task_detail,pending_task,completed_task,payment_info,task_notification , online , message_user_state , user_connections

# Register your models here.

admin.site.register(extended_user_details)
admin.site.register(online)
admin.site.register(task_detail)
admin.site.register(pending_task)
admin.site.register(completed_task)
admin.site.register(payment_info)
admin.site.register(task_notification)
admin.site.register(contactus)
admin.site.register(refund_detail)
admin.site.register(message_user_state)
admin.site.register(user_connections)