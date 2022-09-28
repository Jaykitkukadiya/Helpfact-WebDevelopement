document.onreadystatechange = function() {
    if (document.readyState == "complete") {
        document.querySelector("#loader_message").innerText = "page loaded";   
    }
};

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function getpending(id) {
    console.log("getpending" , id);
    document.getElementById('loading_box').style.display = "block";
    fetch('/api/task/getmoredetails/', {
        method: 'POST',
        headers : {'X-CSRFToken' : getCookie('csrftoken')},
        body: JSON.stringify({'pending_id' : id})
        })
        .then((response) => response.json())
        .then((result) => {
        document.getElementById('loading_box').style.display = "none";
        console.log('Success:', result);
        if(result.code == 200)
        {

            document.getElementById("more_task_id").innerText = result.data.pending_id;
            document.getElementById("more_name").innerText = result.data.name;
            document.getElementById("more_image").href = `/media/${result.data.image}`;
            document.getElementById("more_address").innerText = result.data.address;
            document.getElementById("more_gmaplink").href =`https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${JSON.parse(result.data.gmaplink).lat},${JSON.parse(result.data.gmaplink).lng}&output=embed`;
            document.getElementById("more_pincode").innerText = result.data.pincode;
            document.getElementById("more_mobile_number").innerText = result.data.mobile_number;
            document.getElementById("more_deadline").innerText = new Date(Number(result.data.deadline));
            document.getElementById("more_note").innerText = result.data.note;
            document.getElementById("more_proof").href = `/media/${result.data.proof}`;
            document.getElementById("more_document").href = `/media/${result.data.document}`;
            if(result.data.accepted == 1)
            {
                console.log("sdfsdf");
                document.getElementById("more_user_image").href = `/media/${result.data.user_image}`;
                document.getElementById("more_user_name").innerText = result.data.user_name;
                document.getElementById("more_user_mobile").innerText = result.data.user_mobile;
                document.getElementById("more_user_xender").innerText = result.data.user_xender;
                document.getElementById("user_details").style.display = "block";
            }
            document.getElementById("more_box").style.display = "block";
        }
        else if(result.code == 405)
        {
            document.getElementById("message_text").innerText = result.detail;
                document.getElementById("messsage_box").style.display = "block";
                setTimeout(() => {
                    document.getElementById("messsage_box").style.display = "none";
                }, 1000);
        }
        })
        .catch((error) => {
            document.getElementById("message_text").innerText = error;
            document.getElementById("messsage_box").style.display = "block";
            setTimeout(() => {
                document.getElementById("messsage_box").style.display = "none";
            }, 3000);
        });
        
    }

var more_ids = [];
function addeventmore(list)
{
    list.forEach((ids) => {
        document.getElementById(`more_${ids}`).addEventListener('click', () =>{getpending(ids);});
        delete list[ids];
    });
}

var noti_ids = [];
function addeventdeadline(list)
{
    list.forEach((ids) => {
        var deadline = new Date(Number(document.getElementById(`noti_deadline_number${ids}`).innerText));
        document.getElementById(`noti_deadline_${ids}`).addEventListener('click', () =>{
            document.getElementById("message_text").innerText =  deadline;
            console.log(String(document.getElementById(`noti_deadline_number${ids}`).innerText));
            document.getElementById("messsage_box").style.display = "block";
            setTimeout(() => {
                document.getElementById("messsage_box").style.display = "none";
            }, 3000);
        });
        delete list[ids];
    });
}

function deadline(id,deadline)  {
    document.getElementById("noti_deadline_" + id).onclick = () => {
                    document.getElementById("message_text").innerText =  new Date(deadline);
                    document.getElementById("messsage_box").style.display = "block";
                    setTimeout(() => {
                        document.getElementById("messsage_box").style.display = "none";
                    }, 3000);
                }
}

function component(x, v) {
    return Math.floor(x / v);
}
var interval_var = {};

function accept_task(pending_id)
{
    document.getElementById('compleate_otp_box').style.display = "block";
    document.getElementById('accept_task_btn').style.display = "block";
    document.getElementById('pending_id').innerText = pending_id;
}
function send_accept_task(pending_id , agent_location)
{
    document.getElementById('loading_box').style.display = "block";
    fetch('/api/task/accept/', {
        method: 'POST',
        headers : {'X-CSRFToken' : getCookie('csrftoken')},
        body: JSON.stringify({'pending_id' : pending_id , 'agent_location' : agent_location})
    })
    .then((response) => response.json())
        .then((result) => {
            document.getElementById('loading_box').style.display = "none";
            console.log('Success:', result);
        if(result.code == 200)
        {
            document.getElementById('complete_otp_exit').click();
        }
        else if(result.code == 405)
        {
            document.getElementById("message_text").innerText = result.detail;
                document.getElementById("messsage_box").style.display = "block";
                setTimeout(() => {
                    document.getElementById("messsage_box").style.display = "none";
                }, 2000);
            }
        })
        .catch((error) => {
            document.getElementById("message_text").innerText = error;
            document.getElementById("messsage_box").style.display = "block";
            setTimeout(() => {
                document.getElementById("messsage_box").style.display = "none";
            }, 1000);
        });
    }
    
    
window.onload = () => {
    document.querySelector("#loader_message").innerText = "connecting..";
        
    document.getElementById('accept_task_btn').onclick = () => {
        agent_location = document.getElementById('complete_otp').value;
        pending_id = Number(document.getElementById('pending_id').innerText);
        send_accept_task(pending_id , agent_location);
    }
    
    
    document.getElementById('logout_btn').onclick = () => {
        document.getElementById('loading_box').style.display = "block";
        fetch('/api/logout/', {
            method: 'POST',
            headers : {'X-CSRFToken' : getCookie('csrftoken')},
            body: ""
        })
        .then((response) => response.json())
        .then((result) => {
            document.getElementById('loading_box').style.display = "none";
            console.log('Success:', result);
            if(result.code == 200)
            {
                document.getElementById("success_box").style.display = "block";
                setTimeout(() => {
                    document.getElementById("success_box").style.display = "none";
                    location.href = "/login/";
                } , 2000);
            }
            else if(result.code == 404)
            {
                document.getElementById("message_text").innerText = result.detail;
                    document.getElementById("messsage_box").style.display = "block";
                    setTimeout(() => {
                        document.getElementById("messsage_box").style.display = "none";
                    }, 1000);
                }
                else if(result.code == 405)
            {
                document.getElementById("message_text").innerText = result.detail;
                document.getElementById("messsage_box").style.display = "block";
                setTimeout(() => {
                        document.getElementById("messsage_box").style.display = "none";
                    }, 1000);
                }
            })
            .catch((error) => {
                document.getElementById("message_text").innerText = error;
                document.getElementById("messsage_box").style.display = "block";
                setTimeout(() => {
                    document.getElementById("messsage_box").style.display = "none";
                }, 1000);
            });
            
        }
        
        
var socket = new WebSocket(`ws://${window.location.host}/ws/expire/`);
socket.onopen = (e) => {
    console.log("connected");
    document.querySelector("#loader_message").innerText = "connecting..";
    document.querySelector("#boddy").style.display = "block";
    document.querySelector("#pageloader").style.display = "none";
    socket.send("agent")
}

var pinging = setInterval(() => {
    socket.send("ping")
}, 1000)

    socket.onmessage = (e) => {
        data = JSON.parse(e.data);
        console.log(data);
        if(data.typex == 'session_expire')
        {
            clearInterval(pinging);
            document.getElementById("message_text").innerHTML = `<p style="margin:auto;">${data.detail}</p>`;
            document.getElementById("messsage_box").style.display = "block";
            setTimeout(() => {
                document.getElementById('logout_btn').click();
                document.getElementById("messsage_box").style.display = "none";
            }, 3000);
            
        }
        else if(data.typex == 'notification')
        {
            document.getElementById("noti_container").innerHTML += `
            <div class="notification_container" id="noti_${data.pending_id}">
            <div class="notification_image_container">
            <a href="/media/${data.image}"><img class="notification_image" src="/media/${data.image}" alt="no image"></a>
            </div>
            <div class="notification_detail_container">
            <div style="display: flex; justify-content:space-between">
            <div class="notfication_name">${data.name}</div>
            <div class="notfication_deadline" id="noti_deadline_${data.pending_id}">deadline</div>
            <div id="noti_deadline_number${data.pending_id}" style="display: none;">${data.deadline}</div>
            </div>
            <div class="notification_address">${data.address} - ${data.pincode}</div>
            <div class="notification_btn_container">
            <button class="notification_btn" onclick="accept_task(${data.pending_id})">Accept</button>
            <a target="_blank" href="" id="noti_gmap_${data.pending_id}"><div class="notification_btn">G-link</div>
            </div>
                    </div>
                    </div>
                    `;
                    noti_ids.push(data.pending_id);
                    addeventdeadline(noti_ids);
                    document.getElementById(`noti_gmap_${data.pending_id}`).href = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${JSON.parse(data.gmaplink).lat},${JSON.parse(data.gmaplink).lng}&output=embed`;
    }
    else if(data.typex == "expire")
    {
        document.getElementById(`noti_${data.pending_id}`).remove();
    }
    else if(data.typex == "remove_accepted_task")
    {
        console.log("pending_removed");
        clearInterval(interval_var[`pending_timer_${data.pending_id}`]);
        document.getElementById(`pending_task_${data.pending_id}`).remove();
    }
    else if(data.typex == "accepted")
    {
        document.getElementById(`noti_${data.pending_id}`).remove();
    }
    else if(data.typex == "expire_accepted")
    {
        clearInterval(interval_var[`pending_timer_${data.pending_id}`]);
        document.getElementById(`pending_task_${data.pending_id}`).remove();
        document.getElementById("message_text").innerHTML = `<div style="text-align : center ; margin:10px 0px;">Accepted Task Expired</div><p style="margin:auto;">you loose your entire work for this is task.</p>`;
        document.getElementById("messsage_box").style.display = "block";
        setTimeout(() => {
            document.getElementById("messsage_box").style.display = "none";
        }, 3000);
    }
    else if(data.typex == "newtask")
    {
        document.getElementById("accepted_pending_task_container").innerHTML += `
        <div class="task_denoter_container" id="pending_task_${data.pending_id}">
        <a href="/media/${data.image}"><img src="/media/${data.image}" alt="" class="task_denoter_image"></a>
        <div class="task_denoter_detail_container">
            <div class="task_denoter_name">${data.name}</div>
            <div class="task_denoter_pay_status">${data.mobile}</div>
            <div class="task_denoter_time_remain" id="pending_deadline_${data.pending_id}">initilizing...</div>
            <div id="more_${data.pending_id}" class="more_btn_container" name="${data.pending_id}"><img  style="width: 30px; height: 30px;" src=${more_image} alt="" ></div>
            </div>
    </div>
    `;
    
    more_ids.push(data.pending_id);
    addeventmore(more_ids);
    
    console.log("javascript_call " , data.pending_id);
    setTimeout(() => {
        eval(`var deadline_${data.pending_id}=${new Date(Number(data.deadline)) - Date.now()};`)
        eval(`deadline_${data.pending_id} /= 1000;`)
        eval(`var pending_timer_${data.pending_id} =  setInterval(function () { // execute code each second
            deadline_${data.pending_id} --;
            let hours = component(deadline_${data.pending_id}, 60 * 60); // hours
            let minutes = component(deadline_${data.pending_id}, 60) % 60; // minutes
            let seconds = component(deadline_${data.pending_id}, 1) % 60; // seconds
            if (hours <= 0 && minutes <= 0 && seconds <= 0) {
                document.getElementById("pending_deadline_" + ${data.pending_id}).innerText = "expired..";
                clearInterval(pending_timer_${data.pending_id});
            }
            else
            {
                try
                {
                    document.getElementById("pending_deadline_${data.pending_id}").innerText = hours + ":" + minutes + ":" + seconds ;
                }
                catch
                {
                    clearInterval(pending_timer_${data.pending_id});
                }
            }
        } , 1000 ); interval_var['pending_timer_${data.pending_id}'] = pending_timer_${data.pending_id}`)
    } , 1000)
    
    }
}
window.onbeforeunload = function(event)
{
    socket.send("disconnect");
    socket.onclose = (e) => {
        console.log('disconnect');
        }
        return null;
    };
    

    
    
    // noti_deadline();

    

    document.getElementById("more_exit").onclick = () => {
        document.getElementById("more_box").style.display = "none";
        document.getElementById("user_details").style.display = "none";
        console.log("ok");
    }
    
    // document.write(`<image src={% static 'icon/more.png' %} ></img>`);


    document.getElementById("complete_task_btn").onclick = () => {
        document.getElementById("complete_task_otp_btn").style.display = "block";  
        document.getElementById("compleate_otp_box").style.display = "block";  
    }
    
    document.getElementById("complete_otp_exit").onclick = () => {
        document.getElementById("complete_task_otp_btn").style.display = "none";  
            document.getElementById("compleate_otp_box").style.display = "none";
            document.getElementById("accept_task_btn").style.display = "none";
    }
    document.getElementById("complete_task_otp_btn").onclick = () => {
        document.getElementById('loading_box').style.display = "block";
        var complete_otp = document.getElementById("complete_otp").value;
        fetch('/api/task/complete/', {
            method: 'POST',
            headers : {'X-CSRFToken' : getCookie('csrftoken')},
            body: JSON.stringify({'pending_id' : Number(document.getElementById("more_task_id").innerText) , 'otp' : complete_otp})
            })
            .then((response) => response.json())
            .then((result) => {
            document.getElementById('loading_box').style.display = "none";
            console.log('Success:', result);
            if(result.code == 200)
            {
                document.getElementById("message_text").innerText = result.detail;
                document.getElementById("messsage_box").style.display = "block";
                clearInterval(interval_var[`pending_timer_${result.data.pending_id}`]);
                setTimeout(() => {
                    document.getElementById("complete_otp_exit").click();
                    document.getElementById("more_exit").click();
                    clearInterval(interval_var[`pending_timer_${data.pending_id}`]);
                    document.getElementById(`pending_task_${result.data.pending_id}`).remove();
                    document.getElementById("messsage_box").style.display = "none";
                }, 1000);
            }
            else if(result.code == 400)
            {
                document.getElementById("message_text").innerText = result.detail;
                    document.getElementById("messsage_box").style.display = "block";
                    setTimeout(() => {
                        document.getElementById("messsage_box").style.display = "none";
                    }, 3000);
                }
            else if(result.code == 405)
            {
                document.getElementById("message_text").innerText = result.detail;
                document.getElementById("messsage_box").style.display = "block";
                setTimeout(() => {
                    document.getElementById("messsage_box").style.display = "none";
                }, 3000);
            }
            })
            // .catch((error) => {
            //     document.getElementById("message_text").innerText = error;
            //     document.getElementById("messsage_box").style.display = "block";
            //     setTimeout(() => {
            //         document.getElementById("messsage_box").style.display = "none";
            //     }, 1000);
            // });
    }


}