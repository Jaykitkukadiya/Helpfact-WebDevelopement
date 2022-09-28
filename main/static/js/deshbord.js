// this for page loader
document.onreadystatechange = function () {
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


// this is for google map loading
const initMap = () => {

    // default credentials
    var myLatlng = { lat: 23.206385749040003, lng: 79.38480467450846 };

    const infowindow = new google.maps.InfoWindow();
    const map = new google.maps.Map(document.getElementById("choose_map_location"), {
        zoom: 4,  //choose zoom lavel of google map
        center: myLatlng,
    });

    var marker = "";

    map.addListener("click", (mapsMouseEvent) => {
        var userMarker = mapsMouseEvent.latLng;
        myLatlng = userMarker.toJSON();
        if (marker) {
            marker.setPosition(userMarker);
            // document.getElementById("show").src = `http://maps.google.com/maps?q=${myLatlng.lat},${myLatlng.lng}&z=16&output=embed`;
        }
        else {
            marker = new google.maps.Marker({
                position: userMarker,
                title: document.getElementById("full_name").value
            });
            marker.setMap(map);
            // document.getElementById("show").src = `http://maps.google.com/maps?q=${myLatlng.lat},${myLatlng.lng}&z=16&output=embed`;
        }
        console.log(myLatlng);
        infowindow.setContent(JSON.stringify(myLatlng));
        infowindow.open(map, marker);
        window.myLatlng = myLatlng;
    });
}


function get_popup_message(message, ttl , after = "" , before = "") {
    if(before)
    {
        eval(before);
    }
    document.getElementById("message_text").innerHTML = String(message);
    document.getElementById("messsage_box").style.display = "block";
    setTimeout(() => {
        if(after)
        {
            eval(after);
        }
        document.getElementById("messsage_box").style.display = "none";
    }, ttl);
}


// this is for get more details of pending tasks 
function getpending(id) {

    document.getElementById('loading_box').style.display = "block";

    fetch('/api/task/getmoredetails/', {
        method: 'POST',
        headers : {'X-CSRFToken' : getCookie('csrftoken')},
        body: JSON.stringify({ 'pending_id': id })
    })
        .then((response) => response.json())
        .then((result) => {
            document.getElementById('loading_box').style.display = "none";
            console.log('Success:', result);
            if (result.code == 200) {

                // setup basic details
                document.getElementById("more_task_id").innerText = id;
                document.getElementById("more_name").innerText = result.data.name;
                document.getElementById("more_image").href = `/media/${result.data.image}`;
                document.getElementById("more_address").innerText = result.data.address;
                document.getElementById("more_gmaplink").href = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${JSON.parse(result.data.gmaplink).lat},${JSON.parse(result.data.gmaplink).lng}&output=embed`;
                document.getElementById("more_pincode").innerText = result.data.pincode;
                document.getElementById("more_otp").innerText = result.data.otp;
                document.getElementById("more_mobile_number").innerText = result.data.mobile_number;
                document.getElementById("more_deadline").innerText = new Date(Number(result.data.deadline));
                document.getElementById("more_note").innerText = result.data.note;
                document.getElementById("more_proof").href = `/media/${result.data.proof}`;
                document.getElementById("more_document").href = `/media/${result.data.document}`;
                document.getElementById("task_payment_status").innerText = result.data.payment_status;
                document.getElementById("task_payment_bankname").innerText = result.data.user_bankname;
                document.getElementById("task_payment_mode").innerText = result.data.user_paymentmode;
                document.getElementById("task_payment_id").innerText = result.data.user_txnid;
                document.getElementById("task_payment_date").innerText = result.data.user_txndate;

                if (result.data.accepted == 1) {

                    // setup agent details
                    document.getElementById("more_agent_location").href = result.data.agent_location;
                    document.getElementById("more_agent_image").href = `/media/${result.data.agent_image}`;
                    document.getElementById("more_agent_name").innerText = result.data.agent_name;
                    document.getElementById("more_agent_mobile").innerText = result.data.agent_mobile;
                    document.getElementById("more_agent_xender").innerText = result.data.agent_xender;
                    document.getElementById("more_agent_accept_time").innerText = result.data.accepted_time;

                    // eneble option of agent detail in more box to which toggoled agent info box in more box
                    document.getElementById("get_agent_info").style.display = "block";

                }

                document.body.style.overflow = "hidden"; // for remove back ground scroll while popup shown

                document.getElementById("more_box").style.display = "block";
            }
            else if (result.code == 405) {
                get_popup_message(result.detail, 2000)
            }
        })
        .catch((error) => {
            get_popup_message(error, 2000)
        });

}


// this is for get more details of pending tasks 
function getcompleted(id) {

    document.getElementById('loading_box').style.display = "block";

    fetch('/api/task/complete/getmoredetails/', {
        method: 'POST',
        headers : {'X-CSRFToken' : getCookie('csrftoken')},
        body: JSON.stringify({ 'pending_id': id })
    })
        .then((response) => response.json())
        .then((result) => {
            document.getElementById('loading_box').style.display = "none";
            console.log('Success:', result);
            if (result.code == 200) {

                // setup basic details
                document.getElementById("more_task_id").innerText = id;
                document.getElementById("more_name").innerText = result.data.name;
                document.getElementById("more_image").href = `/media/${result.data.image}`;
                document.getElementById("more_address").innerText = result.data.address;
                document.getElementById("more_gmaplink").href = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${JSON.parse(result.data.gmaplink).lat},${JSON.parse(result.data.gmaplink).lng}&output=embed`;
                document.getElementById("more_pincode").innerText = result.data.pincode;
                document.getElementById("more_otp").innerText = result.data.otp;
                document.getElementById("more_mobile_number").innerText = result.data.mobile_number;
                document.getElementById("more_deadline").innerText = new Date(Number(result.data.deadline));
                document.getElementById("more_note").innerText = result.data.note;
                document.getElementById("more_proof").href = `/media/${result.data.proof}`;
                document.getElementById("more_document").href = `/media/${result.data.document}`;
                document.getElementById("task_payment_status").innerText = result.data.payment_status;
                document.getElementById("task_payment_bankname").innerText = result.data.user_bankname;
                document.getElementById("task_payment_mode").innerText = result.data.user_paymentmode;
                document.getElementById("task_payment_id").innerText = result.data.user_txnid;
                document.getElementById("task_payment_date").innerText = result.data.user_txndate;

                if (result.data.accepted == 1) {

                    // setup agent details
                    document.getElementById("more_agent_location").href = result.data.agent_location;
                    document.getElementById("more_agent_image").href = `/media/${result.data.agent_image}`;
                    document.getElementById("more_agent_name").innerText = result.data.agent_name;
                    document.getElementById("more_agent_mobile").innerText = result.data.agent_mobile;
                    document.getElementById("more_agent_xender").innerText = result.data.agent_xender;
                    document.getElementById("more_agent_accept_time").innerText = result.data.accepted_time;

                    // eneble option of agent detail in more box to which toggoled agent info box in more box
                    document.getElementById("get_agent_info").style.display = "block";

                }

                document.body.style.overflow = "hidden"; // for remove back ground scroll while popup shown

                document.getElementById("more_box").style.display = "block";
            }
            else if (result.code == 405) {
                get_popup_message(result.detail, 2000)
            }
        })
        .catch((error) => {
            get_popup_message(error, 2000)
        });

}

function gmap()
{
    
}

function component(x, v) {
    return Math.floor(x / v);
}
window.onload = () => {
    // change state of loading box
    document.querySelector("#loader_message").innerText = "connecting..";

    // add new task function listener(this is for final add task button inside the add task popup(add button))
    document.getElementById('add_task_btn').onclick = () => {
        document.getElementById('loading_box').style.display = "block";
        document.getElementById('deadline').value = new Date(document.getElementById('deadline_temp').value).getTime();
        document.addtask.submit();
    }
    
    // select choosen location(continue btn in map popup) function
    document.getElementById("select_location").addEventListener('click', () => {
        console.log(window.myLatlng);
        document.getElementById("gmaplink").value = JSON.stringify(window.myLatlng);
        document.getElementById("map_box").style.display = "none";
        document.getElementById("show_map").innerText = "selected";
    })
    

    // logout btn functionality
    document.getElementById('logout_btn').onclick = () => {

        document.getElementById('loading_box').style.display = "block";

        // call logout api
        fetch('/api/logout/', {
            method: 'POST',
            headers : {'X-CSRFToken' : getCookie('csrftoken')},
            body: ""
        })
        .then((response) => response.json())
        .then((result) => {
            document.getElementById('loading_box').style.display = "none";
            console.log('Success:', result);
            if (result.code == 200) {
                get_popup_message(result.detail , 2000 , `location.href = "/login/"`)
            }
            else if (result.code == 404) {
                get_popup_message(result.detail , 2000)
            }
            else if (result.code == 405) {
                get_popup_message(result.detail , 2000)
            }
        })
        .catch((error) => {
            get_popup_message(error , 2000)
        });

    }



    var socket = new WebSocket(`ws://${window.location.host}/ws/expire/`);

    socket.onopen = (e) => {

        // change page loader state
        document.querySelector("#loader_message").innerText = "connected";

        // hide loader and change body to show on display
        document.querySelector("#boddy").style.display = "block";
        document.querySelector("#pageloader").style.display = "none";

        // send that socket is now connected as user mode
        socket.send("user")

    }

    // pinging function to keep connection live
    var pinging = setInterval(() => {
        socket.send("ping")
    }, 5000)


    socket.onmessage = (e) => {
        // parse data 

        data = JSON.parse(e.data);

        // it means this site is open in other window so keep this window close
        if (data.typex == 'session_expire') {
            get_popup_message(`<p style="margin:auto;">${data.detail}</p>` , 2000 , ` document.getElementById('logout_btn').click();` , `clearInterval(${pinging});`)            
        }
        //it means new notification is arrive
        else if (data.typex == 'notification') {
            get_popup_message(`<p style="margin:auto;">notification spreded among agents</p>` , 2000 )     
        }
        // it means pending task is accepted
        else if (data.typex == "accepted") {
            get_popup_message(`<div style="text-align : center ; margin:10px 0px;">Task accepted</div>` , 2000 , `document.getElementById('pending_task_status_${data.pending_id}').innerText = "accepted"`)
        }
        // it means pending task is expire(not accepted tasks)
        else if (data.typex == "expire") {
            get_popup_message(`<div style="text-align : center ; margin:10px 0px;">Task Expired</div><p style="margin:auto;">${data.message}</p>` , 2000 , "" , `document.getElementById(pending_task_${data.pending_id}).remove()`)
        }
        // it means task is completed successfully
        else if (data.typex == "completed") {
            get_popup_message(`<div style="text-align : center ; margin:10px 0px;">Task completed</div><p style="margin:auto;">${data.message}</p>` , 2000 , "" , `clearInterval(timer_${data.pending_id}); document.getElementById(pending_task_${data.pending_id}).remove();`)
        }
    }
    window.onbeforeunload = function (event) {
        socket.send("disconnect");
        console.log('dis')
        // socket.onclose = (e) => {
        //     console.log('disconnect');
        // }
        return null;
    };



    //  this is popup the add task box
    document.getElementById("btn_addtask").onclick = () => {
        document.getElementById("addtesk_box").style.display = "block";
    }

    // exit the add task popup
    document.getElementById("add_exit").onclick = () => {
        document.getElementById("addtesk_box").style.display = "none";
    }

    // exit more box of pending tasks
    document.getElementById("more_exit").onclick = () => {

        document.getElementById("more_box").style.display = "none";

        document.body.style.overflow = "auto"; //this is to restart the scroll of body while pop up closes

        // take more box optional element box(agent info) in to its initial state
        document.getElementById("get_agent_info").style.display = "none";
        document.getElementById("agent_details").style.display = "none";
        document.getElementById('get_agent_info').innerText = "show agent info __";

        // this is become null to get initilize by task id of any task on which whenever user click on more box of any task
        document.getElementById("more_task_id").innerText = "";
    }

    // remove agent
    document.getElementById("remove_agent").onclick = () => {

        id = Number(document.getElementById("more_task_id").innerText);

        if (id) {
            document.getElementById('loading_box').style.display = "block";
            console.log("remove_agent");
            fetch('/api/task/remove_agent/', {
                method: 'POST',
                headers : {'X-CSRFToken' : getCookie('csrftoken')},
                body: JSON.stringify({ 'pending_id': id })
            })
                .then((response) => response.json())
                .then((result) => {
                    document.getElementById('loading_box').style.display = "none";
                    console.log('Success:', result);
                    if (result.code == 200) {
                        get_popup_message(`<p style="margin:auto;">${result.detail}</p>` , 2000 , `document.getElementById("more_exit").click(); document.getElementById("pending_task_status_${id}").innerText = "initilize";`)
                    }
                    else if (result.code == 405) {
                        get_popup_message(`<p style="margin:auto;">${result.detail}</p>` , 2000)
                    }
                })
                .catch((error) => {
                    get_popup_message(`<p style="margin:auto;">${error}</p>` , 2000 )
                });

        }
    }

    // payment info toggle function
    document.getElementById("get_payment_info").onclick = () => {
        if (document.getElementById('task_payment_details').style.display == "none") {
            document.getElementById('task_payment_details').style.display = "block";
            document.getElementById('get_payment_info').innerText = "hide payment info |";
        }
        else {
            document.getElementById('task_payment_details').style.display = "none";
            document.getElementById('get_payment_info').innerText = "show payment info __";
        }
    }

    // agent info toggle function 
    document.getElementById("get_agent_info").onclick = () => {
        if (document.getElementById('agent_details').style.display == "none") {
            document.getElementById("agent_details").style.display = "block";
            document.getElementById('get_agent_info').innerText = "hide agent info |";
        }
        else {
            document.getElementById("agent_details").style.display = "none";
            document.getElementById('get_agent_info').innerText = "show agent info __";
        }
    }

    // google map box show
    document.getElementById("show_map").onclick = () => {
        document.getElementById("map_box").style.display = "block";
    }

    // google map box hide
    document.getElementById("map_exit").onclick = () => {
        document.getElementById("map_box").style.display = "none";
    }


}
