document.onreadystatechange = function () {
    if (document.readyState == "complete") {
        short_notification("Page Loaded. Wait for a while we connect.", 10000)
    }
};


var message_details = {
    user_ids: [],
    user_selected: "",
    online_users : [],
    new_user_list : [], 
    messages: [
        // {
        //     user_id: "2",
        //     message: "",
        //     message_id : ""
        // },

    ],
    selected_message_id : "",
    
}




function dec2hex(dec) {
    return dec.toString(16).padStart(2, "0")
}

// generateId :: Integer -> String
function generateId(len) {
    var arr = new Uint8Array((len || 40) / 2)
    window.crypto.getRandomValues(arr)
    return Array.from(arr, dec2hex).join('')
}


function add_new_message() {
    document.getElementById("new_message_popup_container").classList.remove("hidd");
    setTimeout(() => {
        document.getElementById("new_message_popup").classList.add("new-message-add-box-open");
    } ,1)
}

function message_ac_click_listener(message_socket)
{
    Array.from(message_details["user_ids"]).forEach((id) => {

        document.getElementById(`message_indecator_${id}`).onclick = () => {
            Array.from(message_details["user_ids"]).forEach(
                (idx) => {
                    document.getElementById(`message_indecator_${idx}`).classList.remove("message-account-indecator-selected");
                    document.getElementById(`message_outer_container_${idx}`).classList.add("hidd");
                });
                document.getElementById(`message_indecator_${id}`).classList.remove("message-account-indecator-event-occure");
                document.getElementById(`message_indecator_${id}`).classList.add("message-account-indecator-selected");
            document.getElementById(`message_outer_container_${id}`).classList.remove("hidd");
            document.getElementById("message_ac_name").innerText = document.getElementById(`message_indecator_name_${id}`).innerText;
            if (message_details["online_users"].includes(String(id))) {
                document.getElementById("message_receiver_state").style.backgroundColor = "green";
                document.getElementById("message_text").placeholder = "Message";
                document.getElementById("message_text").disabled  = false;
            }
            else {
                document.getElementById("message_receiver_state").style.backgroundColor = "red";
                document.getElementById("message_text").placeholder = "User is offline";
                document.getElementById("message_text").disabled  = true;
            }
            message_details["user_selected"] = id;
            Array.from(message_details["messages"]).forEach((data) => {
                if (data.user_id == id) {
                    document.getElementById(`message_inner_container_${id}`).innerHTML += `
                        
                    <div class="message-aligner-left" >
                    <div class="message-box" onclick="show_more_opt('${data.message_id}')" id="message_box_${data.message_id}">
                    <span class="message-text" id="message_text_${data.message_id}">${data.message}</span>
                    <span class="message-info-container">
                    <span class="message-time" id="message_time_${data.message_id}">${data.time}</span>
                                </span>
                                </div>
                                </div>
                                
                                `;
                    message_socket.send(JSON.stringify({
                        "typex": "message",
                        "message_type": "viewed_mes",
                        "user_id": userid, //my user id
                        "receiver_id": data.user_id, //id to which i want to send message
                        "message_id": data.message_id,
                        "view_time": new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                    }));
                    message_details["messages"].splice(message_details["messages"].indexOf(data), 1)
                }
            });
            document.getElementById("add_new_message_container").classList.add("hidd");
            document.getElementById("message_body_container").classList.remove("hidd");
            document.getElementById("add_new_message_container_inline").classList.remove("hidd");
            document.getElementById("add_new_message_inline").onclick = add_new_message;
        }
    });
    
}

function message_ac_add_click_listener()
{
    Array.from(message_details["user_ids"]).forEach((id) => {
        
        document.getElementById(`message_indecator_${id}`).onclick = () => {
            Array.from(message_details["user_ids"]).forEach(
                (idx) => {
                    document.getElementById(`message_indecator_${idx}`).classList.remove("message-account-indecator-selected");
                    document.getElementById(`message_outer_container_${idx}`).classList.add("hidd");
                });
                document.getElementById(`message_indecator_${id}`).classList.remove("message-account-indecator-event-occure");
                document.getElementById(`message_indecator_${id}`).classList.add("message-account-indecator-selected");
                document.getElementById(`message_outer_container_${id}`).classList.remove("hidd");
            document.getElementById("message_ac_name").innerText = document.getElementById(`message_indecator_name_${id}`).innerText;
                
            if (message_details["online_users"].includes(String(id))) {
                document.getElementById("message_receiver_state").style.backgroundColor = "green";
                document.getElementById("message_text").placeholder = "Message";
                document.getElementById("message_text").disabled  = false;
            }
            else {
                document.getElementById("message_receiver_state").style.backgroundColor = "red";
                document.getElementById("message_text").placeholder = "User is offline";
                document.getElementById("message_text").disabled  = true;
            }
            message_details["user_selected"] = id;
            
            document.getElementById("add_new_message_container").classList.add("hidd");
            document.getElementById("message_body_container").classList.remove("hidd");
            document.getElementById("add_new_message_container_inline").classList.remove("hidd");
            document.getElementById("add_new_message_inline").onclick = add_new_message;
        }
    });

}

function show_more_opt(message_id)
{
    message_details["selected_message_id"] = message_id;
    document.getElementById("message-ac-detail-container").style.display = "flex";
}

function setnewmessagelistner(){
    Array.from(message_details["new_user_list"]).forEach((new_user_id) => {
        console.log(new_user_id);
        document.getElementById(`new_message_ac_indecator_${new_user_id}`).onclick = () => {
            document.getElementById("message_sidemenu_conainer").innerHTML += `

                <div class="message-account-indecator" id="message_indecator_${new_user_id}">
                    <img class="message-account-image"
                        src="${document.getElementById(`new_message_ac_indecator_image_${new_user_id}`).src}" alt="none">
                    <div class="message-indecator-detail-container">
                        <p class="message-indecator-field" id="message_indecator_name_${new_user_id}">${document.getElementById(`new_message_ac_indecator_fullname_${new_user_id}`).innerText}
                        </p>
                        <p class="message-indecator-field" style="color: gray; font-size: small;">pincode :
                            ${document.getElementById(`new_message_ac_indecator_pincode_${new_user_id}`).innerText}</p>
                    </div>
                </div>
                
                `;
                message_details["user_ids"].push(new_user_id);
                document.getElementById("message_ac_container").innerHTML += `
                            
                            <div class="message-body-message-container hidd" id="message_outer_container_${new_user_id}">
                            <div class="message-body-message-inner-container" id="message_inner_container_${new_user_id}">
                            </div>
                            </div>
                            
                    `;
                document.getElementById("new_message_popup_container").classList.add("hidd");
                message_ac_add_click_listener();
                // document.getElementById(`message_indecator_${new_user_id}`).click();
        }
    });
    message_details["new_user_list"] = [];
}

function new_message_search()
{
    
    query_str = document.getElementById("new_message_ac_search_taxt");

    if(query_str.value == "")
    {
        short_notification("enter name or other detail for search new user" , 5000 , "");
        document.getElementById("new_message_ac_search_taxt").placeholder = "Enter Pincode or email or username";
        document.getElementById("new_message_ac_search_taxt").focus();
    }
    else
    {
        fetch("/api/new_ac_find/", {
            method:"POST",
            headers:{ 'X-CSRFToken': getCookie('csrftoken') },
            body:JSON.stringify({
                "query_str" : query_str.value,
            })
        }).then((response) => response.json()).then((result) => {
            
            console.log(result);
            query_str_value = query_str.value
            query_str.value = "";
    
            if (Array.from(result.data).length == 0)
            {
                document.getElementById("new_message_ac_container").classList.add("hidd");
                document.getElementById("new_message_no_user").classList.remove("hidd");
                query_str.placeholder = "no user found..";
            }
            else
            {
                document.getElementById("new_message_ac_container").innerHTML = "";
                let flag = 0
                Array.from(result.data).forEach((user_obj) => {
                    if( !Array.from(message_details["user_ids"]).includes(String(user_obj.id)) && String(user_obj.id) != String(userid))
                    {
                        console.log(user_obj);
                        flag = 1;
                        document.getElementById("new_message_ac_container").innerHTML += `
                        
                        <div class="new-message-ac-indecator" id="new_message_ac_indecator_${user_obj.id}" >
                        <img class="new-message-indecator-img" id="new_message_ac_indecator_image_${user_obj.id}" src="/media/${user_obj.image}" alt="">
                        <div class="new-message-indecator-detail-container">
                            <p class="new-message-indecator-detail-fullname" id="new_message_ac_indecator_fullname_${user_obj.id}">${user_obj.fullname}</p>
                            <p class="new-message-indecator-detail-inner-container">
                                <span class="new-message-indecator-detail-username">@${user_obj.username}</span> - 
                                <span class="new-message-indecator-detail-pincode" id="new_message_ac_indecator_pincode_${user_obj.id}">${user_obj.pincode}</span>
                            </p>
                        </div>
                        </div>
                        
                        `;
                        message_details["new_user_list"].push(String(user_obj.id));
                        if(user_obj.is_online == 1)
                        {
                            message_details["online_users"].push(String(user_obj.id))
                        }
                    }
                });
                if (flag == 1)
                {
                    document.getElementById("new_message_ac_container").classList.remove("hidd");
                    document.getElementById("new_message_no_user").classList.add("hidd");
                    query_str.placeholder = query_str_value;
                    setnewmessagelistner();
                }
                else
                {
                    query_str.placeholder = "user already added in your contact..";
                }
            }
        });
    }

}

// readymade function
function parseISOString(s) {
    var b = s.split(/\D+/);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}



var open_task_detail = {
    id: [],
    selected_id: "",
    selected_deadline_intervals: [],
    selected_deadline_timestemp: 0,
    selected_map_letlong: "",
};
var completed_task_detail = {
    id: [],
    selected_id: "",
    selected_deadline_intervals: [],
    selected_deadline_timestemp: 0,
    selected_map_letlong: "",
};
var pending_task_detail = {
    id: [],
    selected_id: "",
    selected_interval: "",
    selected_deadline_intervals: [],
    selected_deadline_timestemp: 0,
    selected_map_letlong: "",
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


function get_completed_task_details() {

    favi.href = "/static/icon/favicon_offline.svg";

    fetch('/api/task/complete/getmoredetails/', {
        method: 'POST',
        headers : {'X-CSRFToken' : getCookie('csrftoken')},
        body: JSON.stringify({
            'task_id': Number(completed_task_detail["selected_id"])
        })
    }).then((response) => response.json())
        .then((result) => {
            console.log('Success:', result);
            if (result.code == 200) {

                console.log(result.data)

                load_fixed_map(JSON.parse(result.data.gmaplink), "completed_task_gmap_container")

                document.getElementById("completed_task_more_info_name").innerText = result.data.name;
                document.getElementById("completed_task_more_info_gender").innerText = result.data.gender;
                document.getElementById("completed_task_more_info_pincode").innerText = result.data.pincode;
                document.getElementById("completed_task_more_info_address").innerText = result.data.address;
                if (result.data.agent_payment_status == "success") {
                    document.getElementById("completed_task_more_info_agent_payment_status").src = `/static/icon/true_round.svg`;
                    document.getElementById("completed_payment_info").classList.remove("hidd");
                }
                else if (result.data.agent_payment_status == "pending") {
                    document.getElementById("completed_task_more_info_agent_payment_status").src = `/static/icon/pending_round.svg`;
                    document.getElementById("completed_payment_info").classList.remove("hidd");
                }
                else if (result.data.agent_payment_status == "fail") {
                    document.getElementById("completed_task_more_info_agent_payment_status").src = `/static/icon/false_round.svg`;
                    document.getElementById("completed_payment_info").classList.add("hidd");
                }
                document.getElementById("completed_task_more_info_accepted_time").innerText = result.data.accepted_time;
                document.getElementById("completed_task_more_info_completed_time").innerText = result.data.completed_time;

                document.getElementById("completed_task_more_info_user_name").innerText = result.data.user_name;
                document.getElementById("completed_task_more_info_user_mobile").innerText = result.data.user_mobile;
                document.getElementById("completed_task_more_info_user_gender").innerText = result.data.user_gender;

                document.getElementById("completed_task_more_info_user_profile_image").src = `/media/${result.data.user_image}`;
                document.getElementById("completed_task_more_info_user_profile_image_link").href = `/media/${result.data.user_image}`;


                document.getElementById("completed_task_more_info_image").src = `/media/${result.data.image}`;
                document.getElementById("completed_task_more_info_image_link").href = `/media/${result.data.image}`;
                short_notification("details fetched", 2000)

            } else if (result.code == 405) {
                short_notification(result.detail, 2000)
            }
        })
    // .catch((error) => {
    //     short_notification(error, 2000)
    // });
    favi.href = "/static/icon/fav.svg";

}


function completed_task_select_listener() {
    completed_task_detail['id'].forEach((id) => {
        document.getElementById(`workboard_completed_page_completed_task_${id}`).onclick = () => {
            completed_task_detail['id'].forEach((idx) => {
                document.getElementById(`workboard_completed_page_completed_task_${idx}`).style.backgroundColor = "transparent";
                document.getElementById(`workboard_completed_page_completed_task_${idx}`).style.border = "2px solid #1E75D9";
                document.getElementById(`workboard_completed_page_completed_task_${idx}`).innerText = "Select";
                document.getElementById(`workboard_completed_page_completed_task_${idx}`).style.color = "#1E75D9";
            });
            document.getElementById(`workboard_completed_page_completed_task_${id}`).style.backgroundColor = "#1E75D9";
            document.getElementById(`workboard_completed_page_completed_task_${id}`).style.color = "black";
            document.getElementById(`workboard_completed_page_completed_task_${id}`).style.border = "1px solid #1E75D9";
            document.getElementById("completed_page_more_detail_btn_container").classList.remove("hidd");
            completed_task_detail['selected_id'] = id;
            document.getElementById(`workboard_completed_page_completed_task_${id}`).innerText = "Selected";

        };
    });
}

function pending_card_more_details_listener() {
    Array.from(pending_task_detail['id']).forEach((pending_id) => {
        document.getElementById(`pending_card_${pending_id}`).onclick = () => {
            pending_task_detail['selected_id'] = String(pending_id);
            document.getElementById("page_loading_rounder").classList.remove("hidd");
            // console.log(pending_task_detail['selected_id']);
            // setTimeout(() => {
            //     document.getElementById("page_loading_rounder").classList.add("hidd");
            //     document.getElementById("pending_more_detail_popup").classList.remove("hidd");
            // }, 1000);
            fetch('/api/task/getmoredetails/', {
                method: 'POST',
                headers : {'X-CSRFToken' : getCookie('csrftoken')},
                body: JSON.stringify({ 'pending_id': pending_id })
            })
                .then((response) => response.json())
                .then((result) => {
                    console.log('Success:', result);
                    if (result.code == 200) {
                        pending_task_detail['selected_interval'] = open_task_reverse_timer("pending_task_deadline", result.data.deadline);
                        document.getElementById('pending_task_user_profile_image_link').href = `/media/${result.data.user_image}`;
                        document.getElementById('pending_task_user_profile_image').src = `/media/${result.data.user_image}`;

                        document.getElementById('pending_task_profile_image_link').href = `/media/${result.data.image}`;
                        document.getElementById('pending_task_profile_image').src = `/media/${result.data.image}`;

                        document.getElementById('pending_task_user_name').innerText = `${result.data.user_name}`;
                        document.getElementById('pending_task_user_gender').innerText = `${result.data.user_xender}`;
                        document.getElementById('pending_task_user_mobile').innerText = `${result.data.user_mobile}`;

                        document.getElementById('pending_task_name').innerText = `${result.data.name}`;
                        document.getElementById('pending_task_gender').innerText = `${result.data.gender}`;
                        document.getElementById('pending_task_address').innerText = `${result.data.address}`;
                        document.getElementById('pending_task_pincode').innerText = `${result.data.pincode}`;
                        document.getElementById('pending_task_mobile').innerText = `${result.data.mobile_number}`;
                        document.getElementById('pending_task_accepted_time').innerText = `${result.data.accepted_time}`;
                        document.getElementById('pending_task_note').innerText = `${result.data.note}`;
                        document.getElementById('pending_task_document_link').href = `/media/${result.data.document}`;
                        document.getElementById('pending_task_proof_link').href = `/media/${result.data.proof}`;
                        // document.getElementById('pending_task_gmap_container').href = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${JSON.parse(result.data.gmaplink).lat},${JSON.parse(result.data.gmaplink).lng}&output=embed`
                        load_fixed_map(JSON.parse(result.data.gmaplink), "pending_task_gmap_container");

                        document.getElementById("page_loading_rounder").classList.add("hidd");
                        document.getElementById("pending_more_detail_popup").classList.remove("hidd");
                    }
                    else if (result.code == 405) {
                        short_notification(result.detail, 5000);
                        document.getElementById("page_loading_rounder").classList.add("hidd");
                    }
                })
                .catch((error) => {
                    document.getElementById("page_loading_rounder").classList.add("hidd");
                    short_notification(error, 5000);
                });

        }
    });
}

function open_task_reverse_timer(dest_id, deadline) {
    console.log(deadline)
    // open_task_detail['selected_deadline_timestemp'] = Number(deadline);
    let deadlinetimestemp = (new Date(Number(deadline)) - Date.now()) / 1000;
    let interval_id = setInterval(function () { // execute code each second
        deadlinetimestemp--;
        let hours = Math.floor(deadlinetimestemp / (60 * 60)); // hours
        let minutes = Math.floor(deadlinetimestemp / 60) % 60; // minutes
        let seconds = Math.floor(deadlinetimestemp / 1) % 60; // seconds
        if (hours == 0 && minutes <= 30) {
            document.getElementById(dest_id).style.color = "red";
        }
        if (hours <= 0 && minutes <= 0 && seconds <= 0) {
            document.getElementById(dest_id).innerText = `Task crossing the deadline..`;
            clearInterval(interval_id);
        } else {
            document.getElementById(dest_id).innerText = `${hours}:${minutes}:${seconds} *(H:M:S) `;
        }
    }, 1000);
    return interval_id;

}

function open_task_accept_add_listener() {
    open_task_detail['id'].forEach((id) => {
        document.getElementById(`open_task_accept_${id}`).onclick = () => {
            open_task_detail['selected_id'] = id;
            document.getElementById("open_task_accept_live_location").placeholder = `you have to submit your live location for task id : ${open_task_detail['selected_id']}\n\n*submitting the fake location cause bad effect on your account*`;
            document.getElementById("accept_popup").classList.remove("hidd");
        }
    });
}




var favi = document.querySelector("link[rel~='icon']");

var shortnoti_open = {
    0: 0,
    1: 0,
    2: 0
}

function short_notification(texts = "notification", timex = 5000, action = "") {

    if (document.getElementById("notificationbx").style.display == "block") {
        clearTimeout(shortnoti_open[1]);
        clearTimeout(shortnoti_open[2]);
        document.getElementById("notif_name").style.bottom = "-500px";
        shortnoti_open[0] = setTimeout(() => {
            document.getElementById("notif_name").innerHTML = texts;
            document.getElementById("notif_name").style.bottom = "10px";
        }, 150);
        shortnoti_open[1] = setTimeout(() => {
            document.getElementById("notif_name").style.bottom = "-500px";
        }, timex + 100);
        shortnoti_open[2] = setTimeout(() => {
            document.getElementById("notificationbx").style.display = "none";
            eval(action);
        }, timex + 200);
    } else {
        document.getElementById("notificationbx").style.display = "block";
        shortnoti_open[0] = setTimeout(() => {
            document.getElementById("notif_name").innerHTML = texts;
            document.getElementById("notif_name").style.bottom = "10px";
        }, 100);
        shortnoti_open[1] = setTimeout(() => {
            document.getElementById("notif_name").style.bottom = "-500px";
        }, timex + 100);
        shortnoti_open[2] = setTimeout(() => {
            document.getElementById("notificationbx").style.display = "none";
            eval(action);
        }, timex + 200);
    }
}

// this is for google map loading
const initMap = (divid, storeid, nameid, mylat = "") => {

    // divid : in which div we wants to add map
    // default credentials
    if (mylat == "") {
        var myLatlng = {
            lat: 22.2587,
            lng: 71.1924
        };
    } else {
        var myLatlng = JSON.parse(mylat);
    }

    const infowindow = new google.maps.InfoWindow();
    // const map = new google.maps.Map(document.getElementById("googlemap_container"), {
    const map = new google.maps.Map(document.getElementById(divid), {
        zoom: 7, //choose zoom lavel of google map
        center: myLatlng,
        fullscreenControl: false,
        mapTypeControl: true,
        streetViewControl: true,
    });

    var marker = "";

    map.addListener("click", (mapsMouseEvent) => {
        var userMarker = mapsMouseEvent.latLng;
        myLatlng = userMarker.toJSON();
        if (marker) {
            marker.setPosition(userMarker);
            // document.getElementById("show").src = `http://maps.google.com/maps?q=${myLatlng.lat},${myLatlng.lng}&z=16&output=embed`;
        } else {
            marker = new google.maps.Marker({
                position: userMarker,
                animation: google.maps.Animation.DROP
            });
            marker.setMap(map);
            // document.getElementById("show").src = `http://maps.google.com/maps?q=${myLatlng.lat},${myLatlng.lng}&z=16&output=embed`;
        }
        console.log(myLatlng);
        // if (document.getElementById('add_form_first_name').value != "") {
        if (document.getElementById(nameid).value != "") {
            infowindow.setContent(`<p style="min-width:100px; line-height:15px;text-align:center; padding:0px 12px 12px 0px;">${document.getElementById(nameid).value}</p>`);
            infowindow.open(map, marker);
        }
        document.getElementById(storeid).value = JSON.stringify(myLatlng);
        // document.getElementById('add_form_gmap').value = JSON.stringify(myLatlng);
        short_notification("Location is choosen you can close map.", 10000);
    });

    // document.getElementById("googlemap_container").lastElementChild.style.style.display = "none";
}


function load_fixed_map(myLatlng, divid) {
    const infowindow = new google.maps.InfoWindow();
    const map = new google.maps.Map(document.getElementById(divid), {
        zoom: 7, //choose zoom lavel of google map
        center: myLatlng,
        fullscreenControl: true,
        mapTypeControl: true,
        streetViewControl: true,
        draggable: true
    });


    marker = new google.maps.Marker({
        position: new google.maps.LatLng(myLatlng.lat, myLatlng.lng),
        animation: google.maps.Animation.DROP
    });
    marker.setMap(map);
}

var profile_pages = ['profile_detail', 'update_detail']

var pending_pages = ['pending_task_info', 'pending_user_info', 'pending_location_info', 'pending_manage_task']
var completed_pages = ['completed', 'expired']
var completed_more_pages = ['completed_task_info', 'completed_location_info', 'completed_user_info', "completed_payment_info"]




var sidemenuids = ['sidemenu_profile', 'sidemenu_open_task', 'sidemenu_pending', 'sidemenu_completed','sidemenu_messages']

var deshboard_pages = ['workboard_page_profile', 'workboard_page_open_task', 'workboard_page_pending', 'workboard_page_completed','workboard_page_messages']

function clearmenu() {
    sidemenuids.forEach((allmenu) => {
        allmenuattr = document.getElementById(allmenu);
        document.getElementById(allmenu + "_icon").style.color = "#1E75D9";
        allmenuattr.classList.remove("deshboard-sidemenu-tab-selected");
    });
    deshboard_pages.forEach((allpage) => {
        document.getElementById(allpage).style.display = "none";
    });
}



window.onload = () => {

    window.onscroll = () => {
        if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
            document.getElementById("backtohome").style.visibility = "visible";
        } else {
            document.getElementById("backtohome").style.visibility = "hidden";
        }
    }
    document.getElementById("accept_popup").addEventListener("click", (e) => {
        if (e.target.id == "accept_popup") {
            e.target.classList.add("hidd");
        }
    })
    document.getElementById("pending_more_detail_popup").addEventListener("click", (e) => {
        if (e.target.id == "pending_more_detail_popup") {
            e.target.classList.add("hidd");
            clearInterval(pending_task_detail['selected_interval']);
        }
    })
    document.getElementById("completed_more_detail_popup").addEventListener("click", (e) => {
        if (e.target.id == "completed_more_detail_popup") {
            e.target.classList.add("hidd");
        }
    })

    if (open_task_detail['id'].length == 0) {
        document.getElementById('empty_message').classList.remove('hidd');
        document.getElementById('outer_open_task_container').classList.add('hidd');
    }
    else {
        document.getElementById('outer_open_task_container').classList.remove('hidd');
        document.getElementById('empty_message').classList.add('hidd');
    }

    if (pending_task_detail['id'].length == 0) {
        document.getElementById('pending_empty_message').classList.remove('hidd');
        document.getElementById('pending_card_container').classList.add('hidd');
    }
    else {
        document.getElementById('pending_card_container').classList.remove('hidd');
        document.getElementById('pending_empty_message').classList.add('hidd');
    }


    document.getElementById("open_task_accept_submit").onclick = () => {
        let agent_live_loc = document.getElementById("open_task_accept_live_location").value
        if (agent_live_loc != "") {
            document.getElementById("loading_rounder").classList.remove("hidd");
            fetch('/api/task/accept/', {
                method: 'POST',
                headers : {'X-CSRFToken' : getCookie('csrftoken')},
                body: JSON.stringify({ 'pending_id': Number(open_task_detail['selected_id']), 'agent_location': String(agent_live_loc) })
            })
                .then((response) => response.json())
                .then((result) => {
                    console.log('Success:', result);
                    if (result.code == 200) {
                        document.getElementById('accept_popup').click();
                    }
                    else if (result.code == 405) {
                        document.getElementById("loading_rounder").classList.add("hidd");
                        short_notification(result.detail, 5000);
                    }
                })
                .catch((error) => {
                    document.getElementById("loading_rounder").classList.add("hidd");
                    short_notification(error, 5000);
                });
        }
        else {
            short_notification("please enter the live location", 5000);
        }
    }
    // side menu script

    // sidemenuids.forEach((menu) => {  //this is not working in loop so i created each tab listener saperetly

    side_profileattr = document.getElementById("sidemenu_profile");
    side_profileattr.addEventListener('click', () => {
        clearmenu();
        document.getElementById("sidemenu_profile_icon").style.color = "#175aa7";
        side_profileattr.classList.add("deshboard-sidemenu-tab-selected");
        document.getElementById('workboard_page_profile').style.display = "block";
    });
    side_addattr = document.getElementById("sidemenu_open_task");
    side_addattr.addEventListener('click', () => {
        clearmenu();
        document.getElementById("sidemenu_open_task_icon").style.color = "#175aa7";
        side_addattr.classList.add("deshboard-sidemenu-tab-selected");
        document.getElementById('workboard_page_open_task').style.display = "block";
    });
    side_pendingattr = document.getElementById("sidemenu_pending");
    side_pendingattr.addEventListener('click', () => {
        clearmenu();
        document.getElementById("sidemenu_pending_icon").style.color = "#175aa7";
        side_pendingattr.classList.add("deshboard-sidemenu-tab-selected");
        document.getElementById('workboard_page_pending').style.display = "flex";
    });

    side_completedattr = document.getElementById("sidemenu_completed");
    side_completedattr.addEventListener('click', () => {
        clearmenu();
        document.getElementById("sidemenu_completed_icon").style.color = "#175aa7";
        side_completedattr.classList.add("deshboard-sidemenu-tab-selected");
        document.getElementById('workboard_page_completed').style.display = "block";
    });

    side_messagesattr = document.getElementById("sidemenu_messages");
    side_messagesattr.addEventListener('click', () => {
        clearmenu();
        // document.getElementById("sidemenu_completed_icon").style.color = "#175aa7";
        side_messagesattr.classList.add("deshboard-sidemenu-tab-selected");
        document.getElementById('workboard_page_messages').style.display = "block";
    });

    // }); // end of not working loop


    document.getElementById("logout_request_btn").onclick = () => {
        document.getElementById("loading_rounder").classList.remove("hidd");
        fetch('/api/logout/', {
            method: 'POST',
            headers : {'X-CSRFToken' : getCookie('csrftoken')},
        }).then((response) => response.json())
            .then((result) => {
                if (result.code == 200) {
                    document.getElementById("loading_rounder").classList.add("hidd");
                    location.href = "/login/";
                }
                else {
                    document.getElementById("loading_rounder").classList.add("hidd");
                    short_notification(result.detail, 5000);
                }
            });
    }

    Array.from(profile_pages).forEach((pages) => {
        document.getElementById(`workboard_profile_page_${pages}`).onclick = () => {
            Array.from(profile_pages).forEach((pagesx) => {
                document.getElementById(`workboard_profile_page_${pagesx}`).classList.remove("workboard-page-part-selector-selected");
                document.getElementById(`workboard_profile_page_${pagesx}_page`).classList.add('hidd');
            });
            document.getElementById(`workboard_profile_page_${pages}`).classList.add("workboard-page-part-selector-selected");
            document.getElementById(`workboard_profile_page_${pages}_page`).classList.remove('hidd');

        }
    });

    document.getElementById("workboard_profile_image_update_btn").onclick = () => {
        document.getElementById('workboard_profile_image_updated').click();
    }

    document.getElementById("workboard_profile_image_updated").onchange = () => {
        if (document.getElementById("workboard_profile_image_updated").files[0] != undefined) {

            var fread = new FileReader();
            fread.readAsDataURL(document.getElementById("workboard_profile_image_updated").files[0]);

            fread.onload = function (imag) {
                let profile_update_formdata_image = new FormData()
                profile_update_formdata_image.append("updated_profile_img", document.getElementById("workboard_profile_image_updated").files[0])

                favi.href = "/static/icon/favicon_offline.svg";
                document.getElementById("loading_rounder").classList.remove("hidd");
                fetch("/api/profile/update/image/", {
                    method: "POST",
                    headers : {'X-CSRFToken' : getCookie('csrftoken')},
                    body: profile_update_formdata_image
                }).then((response) => response.json())
                    .then((result) => {
                        console.log(result);
                        document.getElementById("loading_rounder").classList.add("hidd")
                        if (result.code == 200) {
                            short_notification(result.detail, 5000);
                            document.getElementById("workboard_profile_image_show").src = imag.target.result;
                            document.getElementById("workboard_profile_image_link").href = `/media/${result.data.img_url}`;
                        }
                        else {
                            short_notification(result.detail, 5000);
                        }
                    });

                favi.href = "/static/icon/fav.svg";

            };
        }
    }

    document.getElementById("workboard_profile_detail_update_btn").onclick = () => {
        favi.href = "/static/icon/favicon_offline.svg";
        document.getElementById("loading_rounder").classList.remove("hidd");
        updated_info = {}
        if (document.getElementById("workboard_profile_detail_update_fname").value != "") {
            updated_info['fname'] = document.getElementById("workboard_profile_detail_update_fname").value;
        }
        if (document.getElementById("workboard_profile_detail_update_lname").value != "") {
            updated_info['lname'] = document.getElementById("workboard_profile_detail_update_lname").value;
        }
        if (document.getElementById("workboard_profile_detail_update_email").value != "") {
            updated_info['email'] = document.getElementById("workboard_profile_detail_update_email").value;
        }
        if (document.getElementById("workboard_profile_detail_update_mobile").value != "") {
            updated_info['mobile'] = document.getElementById("workboard_profile_detail_update_mobile").value;
        }
        if (document.getElementById("workboard_profile_detail_update_address").value != "") {
            updated_info['address'] = document.getElementById("workboard_profile_detail_update_address").value;
        }
        if (document.getElementById("workboard_profile_detail_update_pincode").value != "") {
            updated_info['pincode'] = document.getElementById("workboard_profile_detail_update_pincode").value;
        }
        fetch("/api/profile/update/", {
            method: "POST",
            headers : {'X-CSRFToken' : getCookie('csrftoken')},
            body: JSON.stringify(updated_info)
        }).then((response) => response.json())
            .then((result) => {
                console.log(result);
                document.getElementById("loading_rounder").classList.add("hidd")
                if (result.code == 200) {
                    if ('pincode' in updated_info) {
                        location.reload();
                    }
                    else {
                        short_notification(result.detail, 5000);
                        for (let k in updated_info) {
                            document.getElementById(`workboard_profile_detail_${k}`).innerText = updated_info[k];
                        }
                        document.getElementById("workboard_profile_page_profile_detail").click();
                    }
                }
                else {
                    short_notification(result.detail, 5000);
                }
            });
        favi.href = "/static/icon/fav.svg";
    }




    Array.from(pending_pages).forEach((pages) => {
        document.getElementById(pages).onclick = () => {
            Array.from(pending_pages).forEach((pagesx) => {
                document.getElementById(pagesx).style.borderColor = "transparent";
                document.getElementById(pagesx).style.color = "gray";
                document.getElementById(`${pagesx}_page`).classList.add('hidd');
            });
            document.getElementById(pages).style.borderColor = "black";
            document.getElementById(pages).style.color = "black";
            document.getElementById(`${pages}_page`).classList.remove('hidd');
        }
    });
    Array.from(completed_more_pages).forEach((pages) => {
        document.getElementById(pages).onclick = () => {
            Array.from(completed_more_pages).forEach((pagesx) => {
                document.getElementById(pagesx).style.borderColor = "transparent";
                document.getElementById(pagesx).style.color = "gray";
                document.getElementById(`${pagesx}_page`).classList.add('hidd');
            });
            document.getElementById(pages).style.borderColor = "black";
            document.getElementById(pages).style.color = "black";
            document.getElementById(`${pages}_page`).classList.remove('hidd');

        }
    });

    Array.from(completed_pages).forEach((pages) => {
        document.getElementById(`workboard_completed_page_part_selector_${pages}`).onclick = () => {
            Array.from(completed_pages).forEach((pagesx) => {
                document.getElementById(`workboard_completed_page_part_selector_${pagesx}`).classList.remove("workboard-page-part-selector-selected");
                document.getElementById(`workboard_completed_page_part_${pagesx}`).classList.add('hidd');
                document.getElementById(`completed_page_more_detail_btn_container`).classList.add('hidd');
            });
            completed_task_detail['id'].forEach((idx) => {
                document.getElementById(`workboard_completed_page_completed_task_${idx}`).style.backgroundColor = "transparent";
                document.getElementById(`workboard_completed_page_completed_task_${idx}`).style.border = "2px solid #1E75D9";
                document.getElementById(`workboard_completed_page_completed_task_${idx}`).innerText = "Select";
                document.getElementById(`workboard_completed_page_completed_task_${idx}`).style.color = "#1E75D9";
            });
            document.getElementById(`workboard_completed_page_part_selector_${pages}`).classList.add("workboard-page-part-selector-selected");
            document.getElementById(`workboard_completed_page_part_${pages}`).classList.remove('hidd');

        }
    });

    document.getElementById("pending_more_cancel_btn").onclick = () => {
        document.getElementById("loading_rounder").classList.remove("hidd");
        fetch('/api/task/agent/cancel/', {
            method: 'POST',
            headers : {'X-CSRFToken' : getCookie('csrftoken')},
            body: JSON.stringify({ 'pending_id': Number(pending_task_detail['selected_id']), 'otp': document.getElementById("pending_more_otp_text").value })
        })
            .then((response) => response.json())
            .then((result) => {
                console.log('Success:', result);
                if (result.code == 200) {
                    document.getElementById("loading_rounder").classList.add("hidd");
                    document.getElementById("pending_more_detail_popup").classList.add("hidd");
                    clearInterval(pending_task_detail['selected_interval']);
                    short_notification("task removing request sent", 5000);
                }
                else if (result.code == 400) {
                    document.getElementById("loading_rounder").classList.add("hidd");
                    short_notification(result.detail, 5000);
                }
                else if (result.code == 401) {
                    document.getElementById("loading_rounder").classList.add("hidd");
                    short_notification(result.detail, 5000);
                }
                else if (result.code == 405) {
                    document.getElementById("loading_rounder").classList.add("hidd");
                    short_notification(result.detail, 5000);
                }
            })
            .catch((error) => {
                document.getElementById("loading_rounder").classList.add("hidd");
                short_notification(error, 5000);
            });
    }

    document.getElementById("pending_more_complete_btn").onclick = () => {
        document.getElementById("loading_rounder").classList.remove("hidd");
        fetch('/api/task/complete/', {
            method: 'POST',
            headers : {'X-CSRFToken' : getCookie('csrftoken')},
            body: JSON.stringify({ 'pending_id': Number(pending_task_detail['selected_id']), 'otp': document.getElementById("pending_more_otp_text").value })
        })
            .then((response) => response.json())
            .then((result) => {
                console.log('Success:', result);
                if (result.code == 200) {
                    document.getElementById("loading_rounder").classList.add("hidd");
                    document.getElementById("pending_more_detail_popup").classList.add("hidd");
                    clearInterval(pending_task_detail['selected_interval']);
                    short_notification("task completed request sent", 5000);
                }
                else if (result.code == 400) {
                    document.getElementById("loading_rounder").classList.add("hidd");
                    short_notification(result.detail, 5000);
                }
                else if (result.code == 405) {
                    document.getElementById("loading_rounder").classList.add("hidd");
                    short_notification(result.detail, 5000);
                }
            })
        // .catch((error) => {
        //     document.getElementById("loading_rounder").classList.add("hidd");
        //     short_notification(error, 5000);
        // });
    }

    document.getElementById("completed_task_more_detail").onclick = () => {
        if (completed_task_detail["selected_id"] != "") {
            document.getElementById("page_loading_rounder").classList.remove("hidd");
            console.log("getinfo for", completed_task_detail["selected_id"]);
            get_completed_task_details();
            document.getElementById("completed_more_detail_popup").classList.remove("hidd");
            document.getElementById("page_loading_rounder").classList.add("hidd");
        } else {
            short_notification("please select any task from completed task page", 5000);
        }
    }






    var socket = new WebSocket(`ws://${window.location.host}/ws/expire/`);
    socket.onopen = (e) => {
        socket.send("agent")
        document.getElementById("sidemenu_profile").click();
        document.getElementById("loading_rounder").classList.add("hidd");
        short_notification("Connected", 3000);
    }

    var pinging = setInterval(() => {
        socket.send("ping")
    }, 3000)

    socket.onmessage = (e) => {
        data = JSON.parse(e.data);
        console.log(data);
        if (data.typex == 'session_expire') {
            clearInterval(pinging);
            short_notification(data.detail, 5000, `location.href = "/";clearInterval(${pinging});`);
        }
        else if (data.typex == "updated") {
            received_data = JSON.parse(data.data);
            if (data.accepted == 1) {
                if ("deadline" in received_data) {

                    Array.from(pending_task_detail['selected_deadline_intervals']).forEach((open_inte) => {
                        if (open_inte.id == `${data.pending_id}`) {
                            clearInterval(open_inte.interval);
                            let emt = pending_task_detail['selected_deadline_intervals'].splice(pending_task_detail['selected_deadline_intervals'].indexOf(open_inte), 1);
                        }
                    })
                    pending_task_detail['selected_deadline_intervals'].push({
                        id: `${data.pending_id}`,
                        interval: open_task_reverse_timer(`pending_task_selector_timer_${data.pending_id}`, Number(received_data.deadline))
                    })
                }
                if ("image" in received_data) {
                    document.getElementById(`pending_task_card_image_${data.pending_id}`).src = `/media/${received_data.image}`;
                }
                document.getElementById("pending_more_detail_popup").classList.add("hidd");
                document.getElementById(`pending_card_${data.pending_id}`).style.backgroundColor = "orange";
                setTimeout(() => {
                    document.getElementById(`pending_card_${data.pending_id}`).style.backgroundColor = "white";
                }, 10000)
                short_notification("your task is updated", 5000)
            }
            else {
                if ("deadline" in received_data) {

                    Array.from(open_task_detail['selected_deadline_intervals']).forEach((open_inte) => {
                        if (open_inte.id == `${data.pending_id}`) {
                            clearInterval(open_inte.interval);
                            let emt = open_task_detail["selected_deadline_intervals"].splice(open_task_detail["selected_deadline_intervals"].indexOf(open_inte), 1);
                        }
                    })
                    open_task_detail['selected_deadline_intervals'].push({
                        id: `${data.pending_id}`,
                        interval: open_task_reverse_timer(`open_task_deadline_${data.pending_id}`, Number(received_data.deadline))
                    })
                }
                if ("image" in received_data) {
                    document.getElementById(`open_task_image_${data.pending_id}`).src = `/media/${received_data.image}`;
                    document.getElementById(`open_task_image_link_${data.pending_id}`).href = `/media/${received_data.image}`;
                    console.log(document.getElementById(`open_task_image_link_${data.pending_id}`))
                    console.log(`/media/${received_data.image}`)

                }
                if ("address" in received_data) {
                    document.getElementById(`open_task_address_${data.pending_id}`).innerText = received_data.address;
                }
                if ("gmap" in received_data) {
                    document.getElementById(`open_task_address_location_link_${data.pending_id}`).href = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${JSON.parse(received_data.gmap).lat},${JSON.parse(received_data.gmap).lng}&output=embed`;
                }
            }
        }
        else if (data.typex == 'notification') {
            if (!open_task_detail['id'].includes(String(data.pending_id))) {

                document.getElementById("open_task_container").innerHTML += `
                <div class="open-task-table-detail" id="open_task_${data.pending_id}">
                <a href="/media/${data.image}" target="_blank" rel="noopener noreferrer" id="open_task_image_link_${data.pending_id}><img id="open_task_image_${data.pending_id}" class="open-task-table-img" src="/media/${data.image}" alt=""></a>
                <div class="open-task-table-name">${data.name}</div>
                <div class="open-task-table-address" id="open_task_address_${data.pending_id}">${data.address}</div>
                <div class="open-task-table-deadline" id="open_task_deadline_${data.pending_id}">...</div>
                <a href="https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${JSON.parse(`${data.gmaplink}`).lat},${JSON.parse(`${data.gmaplink}`).lng}&output=embed" target="_blank" id="open_task_address_location_link_${data.pending_id}">
                <img class="open-task-table-gmap" src="/static/icon/map_location.svg" alt="">
                </a>
                <div class="open-task-table-choose">
                <div class="open-task-accept-btn" id="open_task_accept_${data.pending_id}">
                Accept
                </div>
                </div>
                </div>
                `;
                open_task_detail['id'].push(`${data.pending_id}`);
                open_task_detail['selected_deadline_intervals'].push({
                    id: `${data.pending_id}`,
                    interval: open_task_reverse_timer(`open_task_deadline_${data.pending_id}`, data.deadline)
                });
                open_task_accept_add_listener();
            }
            if (open_task_detail['id'].length == 0) {
                document.getElementById('empty_message').classList.remove('hidd');
                document.getElementById('outer_open_task_container').classList.add('hidd');
            }
            else {
                document.getElementById('outer_open_task_container').classList.remove('hidd');
                document.getElementById('empty_message').classList.add('hidd');
            }
        }
        else if (data.typex == "expire") {
            // same code as accepted
            Array.from(open_task_detail['selected_deadline_intervals']).forEach((inter_id) => {
                if (inter_id.id == Number(data.pending_id)) {
                    clearInterval(inter_id.interval);
                    let emt = open_task_detail["selected_deadline_intervals"].splice(open_task_detail["selected_deadline_intervals"].indexOf(inter_id), 1)
                }
            })
            document.getElementById(`open_task_${data.pending_id}`).remove();
            let id = open_task_detail['id'].splice(open_task_detail['id'].indexOf(`${data.pending_id}`), 1)
            if (open_task_detail['id'].length == 0) {
                document.getElementById('empty_message').classList.remove('hidd');
                document.getElementById('outer_open_task_container').classList.add('hidd');
            }
            else {
                document.getElementById('outer_open_task_container').classList.remove('hidd');
                document.getElementById('empty_message').classList.add('hidd');
            }
        }
        else if (data.typex == "remove_accepted_task") {
            Array.from(pending_task_detail['selected_deadline_intervals']).forEach((inter_id) => {
                if (inter_id.id == Number(data.pending_id)) {
                    clearInterval(inter_id.interval);
                    let emt = pending_task_detail["selected_deadline_intervals"].splice(pending_task_detail["selected_deadline_intervals"].indexOf(inter_id), 1)
                }
            })
            let id = pending_task_detail['id'].splice(pending_task_detail['id'].indexOf(`${data.pending_id}`), 1)
            document.getElementById(`pending_card_${data.pending_id}`).remove();
            short_notification(`you are no longer assigned for ${id}'s task`, 5000);
        }
        else if (data.typex == "accepted") {
            Array.from(open_task_detail['selected_deadline_intervals']).forEach((inter_id) => {
                if (inter_id.id == Number(data.pending_id)) {
                    clearInterval(inter_id.interval);
                    let emt = open_task_detail["selected_deadline_intervals"].splice(open_task_detail["selected_deadline_intervals"].indexOf(inter_id), 1)
                }
            })
            document.getElementById(`open_task_${data.pending_id}`).remove();
            let id = open_task_detail['id'].splice(open_task_detail['id'].indexOf(`${data.pending_id}`), 1)
            if (open_task_detail['id'].length == 0) {
                document.getElementById('empty_message').classList.remove('hidd');
                document.getElementById('outer_open_task_container').classList.add('hidd');
            }
            else {
                document.getElementById('outer_open_task_container').classList.remove('hidd');
                document.getElementById('empty_message').classList.add('hidd');
            }
        }
        else if (data.typex == "expire_accepted") {
            Array.from(pending_task_detail['selected_deadline_intervals']).forEach((inter_id) => {
                if (inter_id.id == Number(data.pending_id)) {
                    let emt = pending_task_detail["selected_deadline_intervals"].splice(pending_task_detail["selected_deadline_intervals"].indexOf(inter_id), 1)
                }
            })
            let id = pending_task_detail['id'].splice(pending_task_detail['id'].indexOf(`${data.pending_id}`), 1)
            document.getElementById(`pending_card_${data.pending_id}`).remove();
            if (pending_task_detail['id'].length == 0) {
                document.getElementById('pending_empty_message').classList.remove('hidd');
                document.getElementById('pending_card_container').classList.add('hidd');
            }
            else {
                document.getElementById('pending_card_container').classList.remove('hidd');
                document.getElementById('pending_empty_message').classList.add('hidd');
            }

            // code for adding task in expired list in completed page
            gender_ico = ""
            payment_ico = ""
            if (data.gender == "Male") {
                gender_ico = "male_symbol.svg";
            }
            else {
                gender_ico = "female_symbol.svg";
            }
            if (data.payment_status == "success") {
                payment_ico = "pending_round.svg"
            }
            else if (data.payment_status == "pending") {
                payment_ico = "pending_round.svg"
            }
            else {
                payment_ico = "false_round.svg"
            }

            document.getElementById("workboard_completed_page_part_expired").innerHTML += `
            <div class="workboard-completed-page-expired-task-detail">
                <img class="workboard-completed-page-expired-task-detail-profile-img"
                    src="/static/icon/user_img.svg" alt="">
                <div class="workboard-completed-page-expired-task-detail-name">
                    ${data.name}</div>
                <img class="workboard-completed-page-expired-task-detail-gender"
                    src="/static/icon/${gender_ico}" alt="">
                <div class="workboard-completed-page-expired-task-detail-mobile">
                    ${data.user_mobile}</div>
                <img class="workboard-completed-page-expired-task-detail-accept"
                    src="/static/icon/${payment_ico}" alt="">
                <div class="workboard-completed-page-expired-task-detail-refid">
                    ${data.task_id}</div>
                <div class="workboard-completed-page-expired-task-detail-select-btn-outer-container">
                    <div class="workboard-completed-page-expired-task-detail-select-btn"
                        id="workboard_completed_page_completed_task_${data.task_id}">
                        Select</div>
                </div>
            </div>
            `;
            completed_task_detail['id'].push(`${data.task_id}`);
            completed_task_select_listener();

            short_notification(`you are no longer eligible for ${id}'s task payment`, 5000);
        }
        else if (data.typex == "newtask") {
            short_notification(`You assigned for ${data.name}'s task`, 3000);
            document.getElementById("loading_rounder").classList.add("hidd");
            if (!pending_task_detail['id'].includes(`${data.pending_id}`)) {

                document.getElementById("pending_card_container").innerHTML += `
                <div class="pending-card" id="pending_card_${data.pending_id}">
                <div class="pending-card-image-container">
                <img class="pending-card-image" src="/media/${data.image}" id="pending_task_card_image_${data.pending_id}"
                alt="">
                </div>
                <div class="pending-card-detail-container">
                <div class="pending-card-name">${data.name}</div>
                <div class="pending-card-timer"
                id="pending_task_selector_timer_${data.pending_id}">...</div>
                </div>
                </div>
                `;
                pending_task_detail['id'].push(`${data.pending_id}`);
                if (pending_task_detail['id'].length == 0) {
                    document.getElementById('pending_empty_message').classList.remove('hidd');
                    document.getElementById('pending_card_container').classList.add('hidd');
                }
                else {
                    document.getElementById('pending_card_container').classList.remove('hidd');
                    document.getElementById('pending_empty_message').classList.add('hidd');
                }
                pending_task_detail['selected_deadline_intervals'].push({
                    id: `${data.pending_id}`,
                    interval: open_task_reverse_timer(`pending_task_selector_timer_${data.pending_id}`, `${data.deadline}`)
                });
                pending_card_more_details_listener();

            }
        }
        else if (data.typex == "completed") {
            Array.from(pending_task_detail['selected_deadline_intervals']).forEach((inter_id) => {
                if (inter_id.id == Number(data.pending_id)) {
                    let emt = pending_task_detail["selected_deadline_intervals"].splice(pending_task_detail["selected_deadline_intervals"].indexOf(inter_id), 1)
                }
            })
            let id = pending_task_detail['id'].splice(pending_task_detail['id'].indexOf(`${data.pending_id}`), 1)
            document.getElementById(`pending_card_${data.pending_id}`).remove();

            if (pending_task_detail['id'].length == 0) {
                document.getElementById('pending_empty_message').classList.remove('hidd');
                document.getElementById('pending_card_container').classList.add('hidd');
            }
            else {
                document.getElementById('pending_card_container').classList.remove('hidd');
                document.getElementById('pending_empty_message').classList.add('hidd');
            }
            // code for adding task in completed list in completed page
            gender_ico = ""
            payment_ico = ""
            if (data.gender == "Male") {
                gender_ico = "male_symbol.svg";
            }
            else {
                gender_ico = "female_symbol.svg";
            }
            if (data.payment_status == "success") {
                payment_ico = "true_round.svg"
            }
            else if (data.payment_status == "pending") {
                payment_ico = "pending_round.svg"
            }
            else {
                payment_ico = "false_round.svg"
            }

            document.getElementById("workboard_completed_page_part_completed").innerHTML += `
            <div class="workboard-completed-page-expired-task-detail">
                <img class="workboard-completed-page-expired-task-detail-profile-img"
                    src="/static/icon/user_img.svg" alt="">
                <div class="workboard-completed-page-expired-task-detail-name">
                    ${data.name}</div>
                <img class="workboard-completed-page-expired-task-detail-gender"
                    src="/static/icon/${gender_ico}" alt="">
                <div class="workboard-completed-page-expired-task-detail-mobile">
                    ${data.user_mobile}</div>
                <img class="workboard-completed-page-expired-task-detail-accept"
                    src="/static/icon/${payment_ico}" alt="">
                <div class="workboard-completed-page-expired-task-detail-refid">
                    ${data.task_id}</div>
                <div class="workboard-completed-page-expired-task-detail-select-btn-outer-container">
                    <div class="workboard-completed-page-expired-task-detail-select-btn"
                        id="workboard_completed_page_completed_task_${data.task_id}">
                        Select</div>
                </div>
            </div>
            `;
            completed_task_detail['id'].push(`${data.task_id}`);
            completed_task_select_listener();
        }
        else if (data.typex == "cancelled") {
            Array.from(open_task_detail['selected_deadline_intervals']).forEach((inter_id) => {
                if (inter_id.id == `${data.pending_id}`) {
                    clearInterval(inter_id.interval);
                    let emt = open_task_detail["selected_deadline_intervals"].splice(open_task_detail["selected_deadline_intervals"].indexOf(inter_id), 1)
                }
            })
            let id = open_task_detail['id'].splice(open_task_detail['id'].indexOf(`${data.pending_id}`), 1)
            console.log(data , )
            document.getElementById(`open_task_${data.pending_id}`).remove();

        }
        else{
            console.log(data)
        }
    }
    window.onbeforeunload = function (event) {
        socket.send("disconnect");
        socket.onclose = (e) => {
            console.log('disconnect');
        }
        return null;
    };



    

    var message_socket = new WebSocket(`ws://${window.location.host}/ws/message/`);

    message_socket.onopen = (e) => {
        // send that socket is now connected as user mode
        message_socket.send(JSON.stringify({
            "typex": "register",
            "user_type": "user",
        }));
        short_notification("Connected to message server", 3000);

    }

    // pinging function to keep connection live
    var pinging_message = setInterval(() => {
        message_socket.send(JSON.stringify({
            "typex": "ping",
            // "receiver_id" : message_details["user_selected"],
        }))
    }, 1000)


    message_socket.onmessage = (e) => {
        data = JSON.parse(e.data);
        console.log(data);

        if (data.typex == 'ping') {
            if (data.receiver_state == 1) {
                document.getElementById("message_receiver_state").style.backgroundColor = "green";
            }
            else {
                document.getElementById("message_receiver_state").style.backgroundColor = "red";
            }
        }

        else if (data.typex == "connection_state") {

            if (message_details["user_selected"] == String(data.connection_id)){

                if (data.state == 1) {
                    document.getElementById("message_receiver_state").style.backgroundColor = "green";
                    document.getElementById("message_text").placeholder = "Message";
                    document.getElementById("message_text").disabled  = false;
                }
                else {
                    document.getElementById("message_receiver_state").style.backgroundColor = "red";
                    document.getElementById("message_text").placeholder = "User is offline";
                    document.getElementById("message_text").disabled  = true;
                }
            }
            if (data.state == 1) {
                message_details["online_users"].push(String(data.connection_id));
            }
            else {
                message_details["online_users"].splice(message_details["online_users"].indexOf(String(data.connection_id)) , 1);
            }
            
        }
        else if (data.typex == "initial_connection_state") {

            if (data.connection_ids.includes(message_details["user_selected"])){
                document.getElementById("message_receiver_state").style.backgroundColor = "green";
                document.getElementById("message_text").placeholder = "Message";
                document.getElementById("message_text").disabled  = false;
            }
            else {
                document.getElementById("message_receiver_state").style.backgroundColor = "red";
                document.getElementById("message_text").placeholder = "User is offline";
                document.getElementById("message_text").disabled  = true;
            }
            
            data.connection_ids.forEach( (id) => {
                if (!message_details["online_users"].includes(String(id))){
                    message_details["online_users"].push(String(id));
                }
                console.log("sd")
            })
        }

        else if (data.typex == 'session_expire') {
            clearInterval(pinging_message);
            short_notification(data.detail, 5000, `location.href = "/";`);
        }

        else if (data.typex == "invelid_data") {
            short_notification(data.detail, 4000)
        }

        else if (data.typex == "message_sent") {
            document.getElementById(`message_${data.detail}`).src = "/static/icon/single_tick.svg"
        }

        else if (data.typex == "new_mess_recv") {
            // send event that mes recved
            detail = JSON.parse(data.detail)

            message_socket.send(JSON.stringify({
                "typex": "message",
                "message_type": "received_mes",
                "user_id": userid, //my user id
                "receiver_id": detail.user_id, //id to which i want to send message
                "message_id": detail.message_id,
                "receive_time": new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
            }));
            // conditions for add messages

            if (document.getElementById("workboard_page_messages").style.display == "none") {
                short_notification("new message received", 3000);
            }

            //tab is already there but not opened yet
            if (message_details["user_ids"].includes(detail.user_id) && message_details["user_selected"] != detail.user_id) {
                message_details["messages"].push(
                    { "user_id": detail.user_id, "message": detail.message, "message_id": detail.message_id, "time": detail.time }
                )
                document.getElementById(`message_indecator_${detail.user_id}`).classList.add("message-account-indecator-event-occure")
            }

            //tab is there and opened
            else if (message_details["user_ids"].includes(detail.user_id) && message_details["user_selected"] == detail.user_id) {
                document.getElementById(`message_inner_container_${detail.user_id}`).innerHTML += `
                
                        <div class="message-aligner-left" >
                        <div class="message-box" onclick="show_more_opt('${detail.message_id}')" id="message_box_${detail.message_id}">
                        <span class="message-text" id="message_text_${detail.message_id}">${detail.message}</span>
                            <span class="message-info-container">
                            <span class="message-time" id="message_time_${detail.message_id}">${detail.time}</span>
                            </span>
                        </div>
                        </div>
                        
                        `;
                message_socket.send(JSON.stringify({
                    "typex": "message",
                    "message_type": "viewed_mes",
                    "user_id": userid, //my user id
                    "receiver_id": detail.user_id, //id to which i want to send message
                    "message_id": detail.message_id,
                    "view_time": new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                }));
            }
        }

        // tab is not available mean new user message come
        else if (data.typex == "new_user_mess_recv") {

            // send event that mes recved
            detail = JSON.parse(data.detail)

            message_socket.send(JSON.stringify({
                "typex": "message",
                "message_type": "received_mes",
                "user_id": userid, //my user id
                "receiver_id": detail.user_id, //id to which i want to send message
                "message_id": detail.message_id,
                "receive_time": new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
            }));
            let user_name = ""
            if (detail.user_fullname.trim() == "") {
                user_name = detail.user_fullname
            }
            else {
                user_name = detail.user_name
            }
            document.getElementById("message_sidemenu_conainer").innerHTML += `
                
                <div class="message-account-indecator" id="message_indecator_${detail.user_id}">
                    <img class="message-account-image"
                        src="/media/${detail.user_img}" alt="none">
                    <div class="message-indecator-detail-container">
                        <p class="message-indecator-field" id="message_indecator_name_${detail.user_id}">${detail.user_name}
                           </p>
                        <p class="message-indecator-field" style="color: gray; font-size: small;">pincode :
                            ${detail.user_pincode}</p>
                    </div>
                </div>
                
                `;
            message_details["user_ids"].push(detail.user_id);
            document.getElementById("message_ac_container").innerHTML += `
                        
                        <div class="message-body-message-container hidd" id="message_outer_container_${detail.user_id}">
                        <div class="message-body-message-inner-container" id="message_inner_container_${detail.user_id}">
                        </div>
                        </div>
                        
                        `;
            message_details["messages"].push(
                { "user_id": detail.user_id, "message": detail.message, "message_id": detail.message_id, "time": detail.time }
            )
            document.getElementById(`message_indecator_${detail.user_id}`).classList.add("message-account-indecator-event-occure");
            message_details["online_users"].push(String(detail.user_id))
            message_ac_click_listener(message_socket);
        }

        else if (data.typex == "received_mes") {
            detail = JSON.parse(data.detail)
            document.getElementById(`message_${detail.message_id}`).src = "/static/icon/double_tick_dark.svg"
        }
        else if (data.typex == "viewed_mes") {
            detail = JSON.parse(data.detail)
            document.getElementById(`message_${detail.message_id}`).src = "/static/icon/double_tick.svg"
        }

    }

    message_socket.onclose = (e) => {
        console.log('disconnect message connection');
    }


    document.getElementById("message_send_btn").onclick = () => {
        let message = document.getElementById("message_text").value;
        console.log(message)
        if (message_details["user_selected"] != "") {
            if (message != "") {
                message_state_id = generateId(13);
                message_socket.send(JSON.stringify({
                    "typex": "message",
                    "message_type": "new_mes",
                    "user_id": String(userid),
                    "receiver_id": message_details["user_selected"],
                    "message_id": message_state_id,
                    "message": message,
                    "time": new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                }));
                document.getElementById(`message_inner_container_${message_details["user_selected"]}`).innerHTML += `

                            <div class="message-aligner-right" >
                                <div class="message-box" onclick="show_more_opt('${message_state_id}')" id="message_box_${message_state_id}">
                                    <span class="message-text" id="message_text_${message_state_id}">${message}</span>
                                    <span class="message-info-container">
                                        <span class="message-time" id="message_time_${message_state_id}">${new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</span>
                                        <img class="message-state-img" id="message_${message_state_id}" src="/static/icon/wait_watch.svg"
                                            alt="">
                                    </span>
                                </div>
                            </div>
                            
                            `;
                document.getElementById("message_text").value = "";
                
                document.getElementById("message_text").focus();
            }
        }
        else {
            short_notification("please select user first", 5000);
        }

    }

    document.getElementById("message_text").addEventListener("keypress", (event) => {
        if (event.key == "Enter") {
            document.getElementById("message_send_btn").click();
        }
    })
    
    message_ac_click_listener(message_socket);

    document.getElementById("message_detail_delete").onclick = () => {
        message_details["selected_message_id"]
    }
    
    document.getElementById("add_new_message").onclick = add_new_message;

    document.getElementById("new_message_popup_container").addEventListener("click", (e) => {
        if (e.target.id == "new_message_popup_container") {
            document.getElementById("new_message_popup").classList.remove("new-message-add-box-open");;
            setTimeout(() => {
                e.target.classList.add("hidd");
                
            } , 1)
        }
    })
    
    document.getElementById("message-ac-detail-container").addEventListener("click", (e) => {
        if (e.target.id == "message-ac-detail-container") {
            document.getElementById("message-ac-detail-container").style.display = "none";
        }
    })
    
    
    document.getElementById("new_message_ac_search_taxt").addEventListener("keypress", (event) => {
        if (event.key == "Enter") {
            new_message_search();
        }
    })
    document.getElementById("new_message_ac_search_btn").onclick = new_message_search;


















    // document.getElementById("pending_details_task_accepted").onclick = () => {
    //     window.scrollTo({
    //         top: document.body.scrollHeight,
    //         behavior: 'smooth'
    //     });
    //     console.log("aggent detail grabed");
    // }
    document.getElementById("backtohome").onclick = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }



}