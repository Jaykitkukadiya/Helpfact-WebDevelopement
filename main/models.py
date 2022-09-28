from django.db import models
from django.contrib.auth.models import User
from io import BytesIO
from PIL import Image
from django.core.files import File


def compress(image , Iquality=50):
    print(Iquality)
    im = Image.open(image)
    im_io = BytesIO() 
    im.save(im_io, 'JPEG', quality=Iquality) 
    new_image = File(im_io, name=image.name)
    return new_image
    

# class exntend_user_details(models.Model):
class extended_user_details(models.Model):
    
    xender_choice = (
        ("Male" , "Male"),
        ("Female" , "Female")
    )
    role_choice = (
        ("user","user"),
        ("agent","agent")
    )
    user = models.OneToOneField(User , on_delete=models.CASCADE )
    image = models.ImageField(upload_to='profile/' , default="profile/defaultprofile.png" , null=True , blank=True)
    mobile_number = models.IntegerField(unique=True , null=True , blank=True)
    address = models.CharField(max_length=1000 , null=True , blank=True)
    pincode = models.CharField(max_length=7 , null=True , blank=True)
    xender = models.CharField(max_length=6 , choices=xender_choice , default="Male" , null=True , blank=True)
    role = models.CharField(max_length=6 , choices=role_choice , default="user" , null=True , blank=True)
    date = models.DateTimeField(auto_now_add = True)


    def save(self, *args, **kwargs):
        if self.pk:
            # If self.pk is not None then it's an update.
            cls = self.__class__
            old = cls.objects.get(pk=self.pk)
            # This will get the current model state since super().save() isn't called yet.
            new = self  # This gets the newly instantiated Mode object with the new values.
            changed_fields = []
            for field in cls._meta.get_fields():
                field_name = field.name
                try:
                    if getattr(old, field_name) != getattr(new, field_name):
                        changed_fields.append(field_name)
                except Exception as ex:  # Catch field does not exist exception
                    pass
            kwargs['update_fields'] = changed_fields
            if 'image' in changed_fields:
                new_image = compress(self.image , 50)
                self.image = new_image
        super().save(*args, **kwargs)


    def __str__(self):
        return self.user.username


class online(models.Model):
    state_choice = (
        ("user","user"),
        ("agent","agent")
    )
    user = models.ForeignKey(User , on_delete=models.CASCADE)
    channel_name = models.CharField(max_length=400)
    state = models.CharField(max_length=6 , choices=state_choice , default="user")
    date = models.DateTimeField(auto_now_add = True)
    # socket_name = models.CharField(max_length = 100 )

    def __str__(self):
        return self.user.username

class message_user_state(models.Model):
    state_choice = (
        ("user","user"),
        ("agent","agent")
    )
    user = models.ForeignKey(User , on_delete=models.CASCADE)
    channel_name = models.CharField(max_length=400)
    state = models.CharField(max_length=6 , choices=state_choice , default="user")
    date = models.DateTimeField(auto_now_add = True)
    # socket_name = models.CharField(max_length = 100 )

    def __str__(self):
        return self.user.username

class user_connections(models.Model):
    user = models.ForeignKey(User , on_delete=models.CASCADE , related_name="user")
    connection = models.ForeignKey(User , on_delete=models.CASCADE , related_name="connection")
    date = models.DateTimeField(auto_now_add = True)

    def __str__(self):
        return f"{self.user.username} to {self.connection.username}"

class task_detail(models.Model):
    gender_choice = (
        ("Male","Male"),
        ("Female","Female")
    )
    user = models.ForeignKey(User , on_delete=models.CASCADE)
    image = models.ImageField(upload_to='task/' , default="profile/defaultprofile.png" ,blank=True , null=True)
    gender = models.CharField(max_length=6 , choices=gender_choice , default="Male")
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=1000 ,blank=True , null=True)
    pincode = models.CharField(max_length=7)
    mobile_number = models.IntegerField(unique=False , blank=True , null=True)
    proof = models.FileField(upload_to='task/proof/' , default="profile/defaultprofile.png" , blank=True , null=True)
    document = models.FileField(upload_to='task/document/' , default="profile/defaultprofile.png" ,blank=True , null=True)
    deadline = models.CharField(max_length=500)
    note = models.CharField(max_length=1000 , blank=True , null=True)
    gmaplink = models.CharField(max_length=1000)
    date = models.DateTimeField(auto_now_add=True)
    


    def save(self, *args, **kwargs):
        if self.pk:
            # If self.pk is not None then it's an update.
            cls = self.__class__
            old = cls.objects.get(pk=self.pk)
            # This will get the current model state since super().save() isn't called yet.
            new = self  # This gets the newly instantiated Mode object with the new values.
            changed_fields = []
            for field in cls._meta.get_fields():
                field_name = field.name
                try:
                    if getattr(old, field_name) != getattr(new, field_name):
                        changed_fields.append(field_name)
                except Exception as ex:  # Catch field does not exist exception
                    pass
            kwargs['update_fields'] = changed_fields
            if 'image' in changed_fields and int(self.image.size) < 5000000:
                new_image = compress(self.image , 30)
                self.image = new_image
            elif 'image' in changed_fields and int(self.image.size) >= 5000000:
                new_image = compress(self.image , 15)
                self.image = new_image

        super().save(*args, **kwargs)

    # def __str__(self):
    #     return self.user.username

# class temp_task_detail(models.Model):
#     user = models.ForeignKey(User , on_delete=models.CASCADE)
#     image = models.ImageField(upload_to='task/')
#     name = models.CharField(max_length=100)
#     address = models.CharField(max_length=1000)
#     pincode = models.CharField(max_length=7)
#     mobile_number = models.IntegerField(unique=False)
#     proof = models.FileField(upload_to='task/proof/')
#     document = models.FileField(upload_to='task/document/')
#     deadline = models.CharField(max_length=7)
#     note = models.CharField(max_length=1000)
#     Gmaplink = models.CharField(max_length=1000)
#     date = models.DateTimeField(auto_now_add=True)

#     # def __str__(self):
#     #     return self.user.username



class payment_info(models.Model):
    status_choice = (
        ("success","success"),
        ("fail","fail"),
        ("pending","pending"),
    )
    task_detail_link = models.OneToOneField(task_detail , on_delete=models.CASCADE , unique=True)
    user = models.ForeignKey(User , on_delete=models.CASCADE)
    user_payment = models.CharField(max_length=100)
    agent_payment = models.CharField(max_length=100)
    user_payment_status = models.CharField(max_length=8 , choices=status_choice , default="fail")
    user_payment_cause = models.CharField(max_length=500 , default="...")
    user_gatewayname =  models.CharField(max_length=500 , default="")
    user_bankname =  models.CharField(max_length=500 , default="")
    user_paymentmode =  models.CharField(max_length=500 , default="")
    user_txnid =  models.CharField(max_length=500 , default="")
    user_orderid =  models.CharField(max_length=500 , default="")
    user_banktxnid =  models.CharField(max_length=500 , default="")
    user_txndate =  models.CharField(max_length=500 , default="")
    agent_payment_status = models.CharField(max_length=8 , choices=status_choice , default="fail")
    agent_payment_cause = models.CharField(max_length=500 , default="...")
    date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.pk:
            # If self.pk is not None then it's an update.
            cls = self.__class__
            old = cls.objects.get(pk=self.pk)
            # This will get the current model state since super().save() isn't called yet.
            new = self  # This gets the newly instantiated Mode object with the new values.
            changed_fields = []
            for field in cls._meta.get_fields():
                field_name = field.name
                try:
                    if getattr(old, field_name) != getattr(new, field_name):
                        changed_fields.append(field_name)
                except Exception as ex:  # Catch field does not exist exception
                    pass
            kwargs['update_fields'] = changed_fields
        super().save(*args, **kwargs)

class pending_task(models.Model):

    status_choice = (
        ("initilize","initilize"),
        ("accepted","accepted")
    )
    payment = models.ForeignKey(payment_info , on_delete=models.DO_NOTHING)
    task_detail_link = models.OneToOneField(task_detail , on_delete=models.CASCADE , unique=True)
    pending_task_agent = models.ForeignKey(User ,on_delete=models.DO_NOTHING , related_name="pending_task_agent" , blank=True , null=True)
    pending_task_user = models.ForeignKey(User , on_delete=models.CASCADE , related_name="pending_task_user")
    status = models.CharField(max_length=10 , choices=status_choice , default="initilize")
    accept_time = models.DateTimeField(blank=True , null=True)
    agent_location = models.CharField(max_length=500, blank=True , null=True)
    otp = models.CharField(max_length=7 , blank=True , null=True)
    otp_cancel = models.CharField(max_length=7 , blank=True , null=True)
    date = models.DateTimeField(auto_now_add=True)
    task_expire_id = models.CharField(max_length=500, blank=True , null=True)

    def save(self, *args, **kwargs):
        if self.pk:
            # If self.pk is not None then it's an update.
            cls = self.__class__
            old = cls.objects.get(pk=self.pk)
            # This will get the current model state since super().save() isn't called yet.
            new = self  # This gets the newly instantiated Mode object with the new values.
            changed_fields = []
            for field in cls._meta.get_fields():
                field_name = field.name
                try:
                    if getattr(old, field_name) != getattr(new, field_name):
                        changed_fields.append(field_name)
                except Exception as ex:  # Catch field does not exist exception
                    pass
            kwargs['update_fields'] = changed_fields
        super().save(*args, **kwargs)



class refund_detail(models.Model):

    refund_status_choice = (
        ("success","success"),
        ("fail","fail"),
        ("pending","pending"),
    )
    
    refund_amount = models.IntegerField()
    refund_id = models.CharField(max_length = 200)
    refund_status = models.CharField(max_length=20 , choices=refund_status_choice , default="pending")
    date = models.DateTimeField(auto_now_add = True)


    def save(self, *args, **kwargs):
        if self.pk:
            # If self.pk is not None then it's an update.
            cls = self.__class__
            old = cls.objects.get(pk=self.pk)
            # This will get the current model state since super().save() isn't called yet.
            new = self  # This gets the newly instantiated Mode object with the new values.
            changed_fields = []
            for field in cls._meta.get_fields():
                field_name = field.name
                try:
                    if getattr(old, field_name) != getattr(new, field_name):
                        changed_fields.append(field_name)
                except Exception as ex:  # Catch field does not exist exception
                    pass
            kwargs['update_fields'] = changed_fields
        super().save(*args, **kwargs)
    


class completed_task(models.Model):

    accepted_choice = (
        ("initilize","initilize"),
        ("accepted","accepted")
    )
    status_choice = (
        ("success","success"),
        ("expired","expired"),
        ("cancelled","cancelled"),
    )
    refund_status_choice = (
        ("-","-"),
        ("pending","pending"),
    )

    payment = models.ForeignKey(payment_info , on_delete=models.DO_NOTHING)
    task_detail_link = models.OneToOneField(task_detail , on_delete=models.CASCADE , unique=True)
    completed_task_agent = models.ForeignKey(User , default=None ,null=True ,on_delete=models.DO_NOTHING , related_name="completed_task_agent")
    completed_task_user = models.ForeignKey(User , on_delete=models.CASCADE , related_name="completed_task_user")
    status = models.CharField(max_length=20 , choices=status_choice , default="expired")
    refund_status = models.CharField(max_length=20 , choices=refund_status_choice , default="-")
    refund_detail = models.ForeignKey(refund_detail ,default=None ,null=True ,on_delete=models.CASCADE, related_name="refund_detail")
    accepted = models.CharField(max_length=10 , choices=accepted_choice , default="initilize")
    accept_time = models.DateTimeField(blank=True , null=True)
    date = models.DateTimeField(auto_now_add=True)



    def save(self, *args, **kwargs):
        if self.pk:
            # If self.pk is not None then it's an update.
            cls = self.__class__
            old = cls.objects.get(pk=self.pk)
            # This will get the current model state since super().save() isn't called yet.
            new = self  # This gets the newly instantiated Mode object with the new values.
            changed_fields = []
            for field in cls._meta.get_fields():
                field_name = field.name
                try:
                    if getattr(old, field_name) != getattr(new, field_name):
                        changed_fields.append(field_name)
                except Exception as ex:  # Catch field does not exist exception
                    pass
            kwargs['update_fields'] = changed_fields
        super().save(*args, **kwargs)


class task_notification(models.Model):
    user = models.ForeignKey(User , on_delete=models.CASCADE)
    task_detail_link = models.ForeignKey(task_detail , on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add = True)

class contactus(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email_address = models.CharField(max_length=100)
    mobile_number = models.CharField(max_length=100 ,default="")
    message = models.CharField(max_length=2000 , default="")
    reply_message = models.CharField(max_length=2000 ,default="")
    date = models.DateTimeField(auto_now_add = True)

    def save(self, *args, **kwargs):
        if self.pk:
            # If self.pk is not None then it's an update.
            cls = self.__class__
            old = cls.objects.get(pk=self.pk)
            # This will get the current model state since super().save() isn't called yet.
            new = self  # This gets the newly instantiated Mode object with the new values.
            changed_fields = []
            for field in cls._meta.get_fields():
                field_name = field.name
                try:
                    if getattr(old, field_name) != getattr(new, field_name):
                        changed_fields.append(field_name)
                except Exception as ex:  # Catch field does not exist exception
                    pass
            kwargs['update_fields'] = changed_fields
        super().save(*args, **kwargs)

    # def save(self, *args, **kwargs):
    #     if self.pk:
    #         cls = self.__class__
    #         old = cls.objects.get(pk=self.pk)
    #         # This will get the current model state since super().save() isn't called yet.
    #         new = self  # This gets the newly instantiated Mode object with the new values.
    #         changed_fields = []
    #         changed_fields_with_value = []
    #         temp = []
    #         for field in cls._meta.get_fields():
    #             field_name = field.name
    #             try:
    #                 print(getattr(old, field_name))
    #                 print(getattr(new, field_name))
    #                 if getattr(old, field_name) != getattr(new, field_name):
    #                     # changed_fields.append(field_name)
    #                     temp.append(str(field_name))
    #                     temp.append(getattr(old, field_name))
    #                     temp.append(getattr(new, field_name))
    #                     changed_fields_with_value.append(str(temp))
    #                     changed_fields.append(field_name)
                        

    #             except Exception as ex:  # Catch field does not exist exception
    #                 pass
    #             temp = []
    #             print(changed_fields_with_value)
    #         kwargs['update_fields'] = changed_fields
    #         # kwargs['values'] = changed_fields_with_value #this is not working
    #     super().save(*args, **kwargs)





