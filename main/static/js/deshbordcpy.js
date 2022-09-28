
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

var pending_task_detail = {
    id: [],
    selected_id: "",
    selected_deadline_intervals: [],
    selected_deadline_timestemp: 0,
    selected_map_letlong: "",
};
var completed_task_detail = {
    completed_ids: [],
    completed_selected_id: "",
    page_part_list: ["completed", "expired", "cancelled"],
    detail_page_part_list: ["basic_info", "payment_info", "agent_info", "refund_info"]
};



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


// var cancelled_task_detail = {
//     cancelled_ids: [],
//     cancelled_selected_id: "",
// };
var update_proof_listner, update_document_listner;

var favi = document.querySelector("link[rel~='icon']");

function pending_task_select_listener() {
    pending_task_detail['id'].forEach((id) => {
        document.getElementById(`pending_task_select_${id}`).addEventListener('click', () => {
            pending_task_detail['id'].forEach((idx) => {
                document.getElementById(`pending_task_select_${idx}`).style.backgroundColor = "#1E75D9";
                document.getElementById(`pending_task_select_${idx}`).innerText = "Select";
            });
            document.getElementById(`pending_task_select_${id}`).style.backgroundColor = "#212121c0";
            pending_task_detail['selected_id'] = id;
            document.getElementById(`pending_task_select_${id}`).innerText = "Selected";

        });
    });
}

function completed_task_select_listener() {
    completed_task_detail['completed_ids'].forEach((id) => {
        document.getElementById(`completed_page_completed_task_${id}`).onclick = () => {
            completed_task_detail['completed_ids'].forEach((idx) => {
                document.getElementById(`completed_page_completed_task_${idx}`).style.backgroundColor = "transparent";
                document.getElementById(`completed_page_completed_task_${idx}`).style.border = "2px solid #1E75D9";
                document.getElementById(`completed_page_completed_task_${idx}`).innerText = "Select";
                document.getElementById(`completed_page_completed_task_${idx}`).style.color = "#1E75D9";
            });
            document.getElementById(`completed_page_completed_task_${id}`).style.backgroundColor = "#1E75D9";
            document.getElementById(`completed_page_completed_task_${id}`).style.color = "black";
            document.getElementById(`completed_page_completed_task_${id}`).style.border = "1px solid #1E75D9";
            document.getElementById("completed_page_more_detail_btn_container").classList.remove("hidd");
            completed_task_detail['completed_selected_id'] = id;
            document.getElementById(`completed_page_completed_task_${id}`).innerText = "Selected";

        };
    });
}

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

// var short_noti_ids = [];
// var short_noti_counter = 0;

// function notitimer(id, texts, bottom_pad, timex, action) {
//     document.getElementById(`short_noti_texts_${id}`).innerHTML = texts;
//     setTimeout(() => {
//         document.getElementById(`short_noti_texts_${id}`).style.bottom = `${bottom_pad}px`;
//     }, 100);
//     setTimeout(() => {
//         document.getElementById(`short_noti_texts_${id}`).style.bottom = "-500px";

//         let array_pointer = short_noti_ids.indexOf(id);
//         short_noti_ids.splice(array_pointer, 1);
//         if (short_noti_ids.length == 0) {
//             short_noti_counter = 0;
//         }

//     }, timex + 100);
//     setTimeout(() => {
//         document.getElementById(`short_noti_texts_${id}`).remove();
//         eval(action);
//     }, timex + 200);
// }

// function short_notification(texts = "notification", timex = 5000, action = "") {
//     if (short_noti_ids.length == 0) {
//         bottom_pad = 10;
//     } else {
//         bottom_pad = (short_noti_ids.length * (50)) + 10;
//     }
//     id = short_noti_counter + 1;
//     var div = document.createElement('div');
//     div.id = `short_noti_texts_${id}`;
//     div.innerHTML = `...`;
//     div.className = 'notification-box';
//     document.getElementById("noti_container").appendChild(div);

//     short_noti_ids.push(id);
//     notitimer(id, texts, bottom_pad, timex, action);
//     short_noti_counter++;
// }


// this is for google map loading
const initMap = (divid, storeid, nameid, mylat = "") => {

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
        mapTypeControl: false,
        streetViewControl: false,
        draggable: false
    });


    marker = new google.maps.Marker({
        position: new google.maps.LatLng(myLatlng.lat, myLatlng.lng),
        map: map,
        animation: google.maps.Animation.DROP
    });

    marker.bindTo('position', map, 'center');
}





function generate_reverse_timer(task_id, datestr) {
    pending_task_detail['selected_deadline_timestemp'] = Number(datestr);
    let deadlinetimestemp = (new Date(Number(datestr)) - Date.now()) / 1000;
    let interval_id = setInterval(function () { // execute code each second
        deadlinetimestemp--;
        let hours = Math.floor(deadlinetimestemp / (60 * 60)); // hours
        let minutes = Math.floor(deadlinetimestemp / 60) % 60; // minutes
        let seconds = Math.floor(deadlinetimestemp / 1) % 60; // seconds
        if (hours <= 0 && minutes <= 0 && seconds <= 0) {
            document.getElementById("pending_details_task_deadline_timer").innerText = `Task crossing the deadline..`;
            clearInterval(interval_id);
        } else {
            document.getElementById("pending_details_task_deadline_timer").innerText = `${hours}:${minutes}:${seconds} *(H:M:S) `;
        }
    }, 1000);
    pending_task_detail['selected_deadline_intervals'].push({
        id: task_id,
        interval: interval_id
    });
}



var profile_pages = ['profile_detail', 'update_detail']

var sidemenuids = ['sidemenu_profile', 'sidemenu_add', 'sidemenu_pending', 'sidemenu_completed', 'sidemenu_messages']
var dashboard_pages = ['dashboard_page_profile', 'dashboard_page_add', 'dashboard_page_pending', 'dashboard_page_completed', 'dashboard_page_message']

function clearmenu() {
    sidemenuids.forEach((allmenu) => {
        allmenuattr = document.getElementById(allmenu);
        document.getElementById(allmenu + "_icon").style.color = "#1E75D9";
        allmenuattr.classList.remove("dashboard-sidemenu-tab-selected");
    });
    dashboard_pages.forEach((allpage) => {
        document.getElementById(allpage).style.display = "none";
    });
}

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


function get_task_details() {
    favi.href = "/static/icon/favicon_offline.svg";

    pending_task_detail['selected_deadline_intervals'].forEach((intervalobj) => {
        clearInterval(intervalobj.interval);
    });


    if (pending_task_detail['selected_id'] != "") {
        fetch('/api/task/getmoredetails/', {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
            body: JSON.stringify({
                'pending_id': Number(pending_task_detail['selected_id'])
            })
        })
            .then((response) => response.json())
            .then((result) => {
                console.log('Success:', result);
                if (result.code == 200) {

                    // setup task image
                    document.getElementById("pending_details_profile_image").src = `/media/${result.data.image}`;
                    document.getElementById("pending_details_profile_image").classList.remove("hidd");
                    document.getElementById("pending_details_default_profile_image").classList.add("hidd");
                    document.getElementById("pending_details_profile_image_link").href = `/media/${result.data.image}`;

                    document.getElementById("pending_details_name").innerText = result.data.name;
                    document.getElementById("pending_details_task_address").innerText = result.data.address;
                    document.getElementById("pending_details_task_pincode").innerText = result.data.pincode;
                    document.getElementById("pending_details_task_mobile").innerText = result.data.mobile_number;
                    document.getElementById("pending_details_task_note").innerText = result.data.note;
                    document.getElementById("pending_details_task_proof_btn").href = `/media/${result.data.proof}`;
                    document.getElementById("pending_details_task_document_btn").href = `/media/${result.data.document}`;

                    // setup payment info
                    document.getElementById("pending_details_payment_status").innerText = result.data.payment_status;
                    document.getElementById("pending_details_payment_bank").innerText = result.data.user_bankname;
                    document.getElementById("pending_details_payment_mode").innerText = result.data.user_paymentmode;
                    document.getElementById("pending_details_payment_id").innerText = result.data.user_txnid;
                    document.getElementById("pending_details_payment_date").innerText = result.data.user_txndate;

                    // steup map
                    pending_task_detail['selected_map_letlong'] = result.data.gmaplink;
                    load_fixed_map(JSON.parse(result.data.gmaplink), "pending_details_map_container")
                    if (result.data.accepted == 1) {

                        // setup task accepted basic operation
                        document.getElementById("pending_details_task_waiting").classList.add("hidd");
                        document.getElementById("pending_details_task_accepted").classList.remove("hidd");
                        document.getElementById("pending_details_agent_block").classList.remove("hidd");

                        // steup agent image
                        document.getElementById("pending_details_agent_profile_image").classList.remove("hidd");
                        document.getElementById("pending_details_agent_default_profile_image").classList.add("hidd");
                        document.getElementById("pending_details_agent_profile_image").src = `/media/${result.data.agent_image}`;
                        document.getElementById("pending_details_agent_profile_image_link").href = `/media/${result.data.agent_image}`;

                        document.getElementById("pending_details_agent_track_agent_btn").href = result.data.agent_location;
                        document.getElementById("pending_details_agent_name").innerText = result.data.agent_name;
                        document.getElementById("pending_details_agent_mobile").innerText = result.data.agent_mobile;
                        document.getElementById("pending_details_agent_accepted_time").innerText = String(parseISOString(`${result.data.accepted_time}`));

                        // setup icon for gender
                        if (result.data.agent_xender == "Male") {
                            document.getElementById("pending_details_agent_gender_denoter").src = "/static/icon/boy.svg";

                        } else {
                            document.getElementById("pending_details_agent_gender_denoter").src = "/static/icon/girl.svg";
                        }
                        document.getElementById("pending_details_agent_gender").innerText = result.data.agent_xender;

                    } else {

                        // setup waiting state task's basic operation
                        document.getElementById("pending_details_task_waiting").classList.remove("hidd");
                        document.getElementById("pending_details_task_accepted").classList.add("hidd");
                        document.getElementById("pending_details_agent_block").classList.add("hidd");

                    }
                    // setup deadline
                    generate_reverse_timer(Number(pending_task_detail['selected_id']), result.data.deadline);

                    document.getElementById("pending_task_status_container").classList.remove("hidd");
                    document.getElementById("pending_task_empty_detail_container").classList.add("hidd");
                    document.getElementById("pending_task_detail_container").classList.remove("hidd");
                } else if (result.code == 405) {

                    short_notification(result.detail, 5000);

                }
            })
            .catch((error) => {
                short_notification(error, 5000);
            });
        document.getElementById("pending_task_controller_container").classList.remove("hidd");
        console.log("SELECTED IF", pending_task_detail['selected_id']);
    } else {
        short_notification("please select any task to get details", 5000);
    }
    favi.href = "/static/icon/fav.svg";
}



function get_completed_task_details() {

    favi.href = "/static/icon/favicon_offline.svg";

    if (completed_task_detail["completed_selected_id"] != "") {
        fetch('/api/task/complete/getmoredetails/', {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
            body: JSON.stringify({
                'task_id': Number(completed_task_detail["completed_selected_id"])
            })
        }).then((response) => response.json())
            .then((result) => {
                console.log('Success:', result);
                if (result.code == 200) {

                    console.log(result.data)

                    load_fixed_map(JSON.parse(result.data.gmaplink), "completed_task_more_detail_task_map")

                    document.getElementById("completed_task_more_detail_ref_id").innerText = result.data.pending_id;
                    document.getElementById("completed_task_more_detail_task_name").innerText = result.data.name;
                    document.getElementById("completed_task_more_detail_task_gender").innerText = result.data.gender;
                    document.getElementById("completed_task_more_detail_task_address").innerText = result.data.address;
                    document.getElementById("completed_task_more_detail_task_pincode").innerText = result.data.pincode;
                    document.getElementById("completed_task_more_detail_task_mobile").innerText = result.data.mobile_number;
                    document.getElementById("completed_task_more_detail_task_note").innerText = result.data.note;
                    document.getElementById("completed_task_more_detail_task_completed_time").innerText = String(parseISOString(`${result.data.completed_time}`));
                    if (result.data.accepted == 1) {
                        document.getElementById("completed_task_more_detail_task_accepted").src = `/static/icon/true_round.svg`;
                        document.getElementById("completed_page_detail_part_selector_agent_info").classList.remove("hidd");

                        document.getElementById("completed_task_more_detail_task_accepted_time").innerText = String(parseISOString(`${result.data.accepted_time}`));
                        document.getElementById("completed_task_more_detail_task_accepted_time_container").classList.remove("hidd");

                        document.getElementById("completed_task_more_detail_agent_name").innerText = result.data.agent_name;
                        document.getElementById("completed_task_more_detail_agent_mobile").innerText = result.data.agent_mobile;
                        document.getElementById("completed_task_more_detail_agent_gender").innerText = result.data.agent_xender;

                        document.getElementById("completed_task_more_details_agent_profile_image").src = `/media/${result.data.agent_image}`;
                        document.getElementById("completed_task_more_details_agent_profile_image").classList.remove("hidd");
                        document.getElementById("completed_task_more_details_agent_default_profile_image").classList.add("hidd");
                        document.getElementById("completed_task_more_details_agent_profile_image_link").href = `/media/${result.data.agent_image}`;
                    } else {
                        document.getElementById("completed_task_more_detail_task_accepted_time").innerText = result.data.accepted_time;
                        document.getElementById("completed_task_more_detail_task_accepted_time_container").classList.add("hidd");

                        document.getElementById("completed_page_detail_part_selector_agent_info").classList.add("hidd");
                        document.getElementById("completed_task_more_detail_task_accepted").src = `/static/icon/false_round.svg`;
                    }

                    document.getElementById("completed_task_more_details_profile_image").src = `/media/${result.data.image}`;
                    document.getElementById("completed_task_more_details_profile_image").classList.remove("hidd");
                    document.getElementById("completed_task_more_details_default_profile_image").classList.add("hidd");
                    document.getElementById("completed_task_more_details_default_profile_image_link").href = `/media/${result.data.image}`;
                    document.getElementById("completed_task_more_detail_task_proof").href = `/media/${result.data.proof}`;
                    document.getElementById("completed_task_more_detail_task_document").href = `/media/${result.data.document}`;


                    document.getElementById("completed_task_more_details_payment_status").innerText = result.data.payment_status;
                    document.getElementById("completed_task_more_details_payment_bank").innerText = result.data.user_bankname;
                    document.getElementById("completed_task_more_details_payment_mode").innerText = result.data.user_paymentmode;
                    document.getElementById("completed_task_more_details_payment_id").innerText = result.data.user_txnid;
                    document.getElementById("completed_task_more_details_payment_date").innerText = result.data.user_txndate;


                    // document.getElementById("completed_detail_popup_detail_container").innerText = result.data;
                    // // setup basic details
                    // document.getElementById("more_task_id").innerText = id;
                    // document.getElementById("more_name").innerText = result.data.name;
                    // document.getElementById("more_image").href = `/media/${result.data.image}`;
                    // document.getElementById("more_address").innerText = result.data.address;
                    // document.getElementById("more_gmaplink").href = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${JSON.parse(result.data.gmaplink).lat},${JSON.parse(result.data.gmaplink).lng}&output=embed`;
                    // document.getElementById("more_pincode").innerText = result.data.pincode;
                    // document.getElementById("more_otp").innerText = result.data.otp;
                    // document.getElementById("more_mobile_number").innerText = result.data.mobile_number;
                    // document.getElementById("more_deadline").innerText = new Date(Number(result.data.deadline));
                    // document.getElementById("more_note").innerText = result.data.note;
                    // document.getElementById("more_proof").href = `/media/${result.data.proof}`;
                    // document.getElementById("more_document").href = `/media/${result.data.document}`;
                    // document.getElementById("task_payment_status").innerText = result.data.payment_status;
                    // document.getElementById("task_payment_bankname").innerText = result.data.user_bankname;
                    // document.getElementById("task_payment_mode").innerText = result.data.user_paymentmode;
                    // document.getElementById("task_payment_id").innerText = result.data.user_txnid;
                    // document.getElementById("task_payment_date").innerText = result.data.user_txndate;

                    // if (result.data.accepted == 1) {

                    //     // setup agent details
                    //     document.getElementById("more_agent_location").href = result.data.agent_location;
                    //     document.getElementById("more_agent_image").href = `/media/${result.data.agent_image}`;
                    //     document.getElementById("more_agent_name").innerText = result.data.agent_name;
                    //     document.getElementById("more_agent_mobile").innerText = result.data.agent_mobile;
                    //     document.getElementById("more_agent_xender").innerText = result.data.agent_xender;
                    //     document.getElementById("more_agent_accept_time").innerText = result.data.accepted_time;

                    //     // eneble option of agent detail in more box to which toggoled agent info box in more box
                    //     document.getElementById("get_agent_info").style.display = "block";

                    // }

                    // document.body.style.overflow = "hidden"; // for remove back ground scroll while popup shown

                    // document.getElementById("more_box").style.display = "block";
                } else if (result.code == 405) {
                    short_notification(result.detail, 2000)
                }
            })
            .catch((error) => {
                short_notification(error, 2000)
            });
    } else {
        short_notification("please select any task to get details", 5000);
    }
    favi.href = "/static/icon/fav.svg";

}



window.onload = () => {

    if (pending_task_detail['id'].length > 0) {
        document.getElementById("pending_task_status_container").classList.remove("hidd");
        document.getElementById("pending_task_controller_container").classList.add("hidd");
        document.getElementById("pending_task_empty_detail_container").innerText = "No tasks are selected";
    }

    window.onscroll = () => {
        if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
            document.getElementById("backtohome").style.visibility = "visible";
        } else {
            document.getElementById("backtohome").style.visibility = "hidden";
        }
    }

    // side menu script

    // sidemenuids.forEach((menu) => {  //this is not working in loop so i created each tab listener saperetly

    side_profileattr = document.getElementById("sidemenu_profile");
    side_profileattr.addEventListener('click', () => {
        clearmenu();
        document.getElementById("sidemenu_profile_icon").style.color = "#175aa7";
        side_profileattr.classList.add("dashboard-sidemenu-tab-selected");
        document.getElementById('dashboard_page_profile').style.display = "block";
    });
    side_addattr = document.getElementById("sidemenu_add");
    side_addattr.addEventListener('click', () => {
        clearmenu();
        document.getElementById("sidemenu_add_icon").style.color = "#175aa7";
        side_addattr.classList.add("dashboard-sidemenu-tab-selected");
        document.getElementById('dashboard_page_add').style.display = "block";
    });
    side_pendingattr = document.getElementById("sidemenu_pending");
    side_pendingattr.addEventListener('click', () => {
        clearmenu();
        document.getElementById("sidemenu_pending_icon").style.color = "#175aa7";
        side_pendingattr.classList.add("dashboard-sidemenu-tab-selected");
        document.getElementById('dashboard_page_pending').style.display = "block";
        if (document.getElementById("pending_details_map_container").innerHTML == "") {
            var myLatlng = {
                lat: 22.2587,
                lng: 71.1924
            };
            load_fixed_map(myLatlng, "pending_details_map_container");
        }
        console.log("pending map loded");
    });
    side_completedattr = document.getElementById("sidemenu_completed");
    side_completedattr.addEventListener('click', () => {
        clearmenu();
        document.getElementById("sidemenu_completed_icon").style.color = "#175aa7";
        side_completedattr.classList.add("dashboard-sidemenu-tab-selected");
        document.getElementById('dashboard_page_completed').style.display = "block";
        document.getElementById("completed_page_part_selector_completed").click();
        document.getElementById(`completed_page_part_selector_completed`).style.borderColor = "#1E75D9";
        document.getElementById(`completed_page_part_selector_completed`).style.color = "#175aa7";
        document.getElementById(`completed_page_part_completed`).classList.remove("hidd");
    });
    side_messageattr = document.getElementById("sidemenu_messages");
    side_messageattr.addEventListener('click', () => {
        clearmenu();
        side_messageattr.classList.add("dashboard-sidemenu-tab-selected");
        document.getElementById('dashboard_page_message').style.display = "block";
    });

    // }); // end of not working loop




    // profile script

    try {
        document.getElementById("agent_request_btn").onclick = () => {
            location.href = "/profile/update/agent/"
        }
    }
    catch
    {
        console.log("user is authenticated as agent");
    }

    document.getElementById("logout_request_btn").onclick = () => {
        document.getElementById("loading_rounder").classList.remove("hidd");
        fetch('/api/logout/', {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
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
        document.getElementById(`dashboard_profile_page_${pages}`).onclick = () => {
            Array.from(profile_pages).forEach((pagesx) => {
                document.getElementById(`dashboard_profile_page_${pagesx}`).classList.remove("dashboard-page-part-selector-selected");
                document.getElementById(`dashboard_profile_page_${pagesx}_page`).classList.add('hidd');
            });
            document.getElementById(`dashboard_profile_page_${pages}`).classList.add("dashboard-page-part-selector-selected");
            document.getElementById(`dashboard_profile_page_${pages}_page`).classList.remove('hidd');

        }
    });

    document.getElementById("dashboard_profile_image_update_btn").onclick = () => {
        document.getElementById('dashboard_profile_image_updated').click();
    }

    document.getElementById("dashboard_profile_image_updated").onchange = () => {
        if (document.getElementById("dashboard_profile_image_updated").files[0] != undefined) {

            var fread = new FileReader();
            fread.readAsDataURL(document.getElementById("dashboard_profile_image_updated").files[0]);

            fread.onload = function (imag) {
                let profile_update_formdata_image = new FormData()
                profile_update_formdata_image.append("updated_profile_img", document.getElementById("dashboard_profile_image_updated").files[0])

                favi.href = "/static/icon/favicon_offline.svg";
                document.getElementById("loading_rounder").classList.remove("hidd");
                fetch("/api/profile/update/image/", {
                    method: "POST",
                    headers: { 'X-CSRFToken': getCookie('csrftoken') },
                    body: profile_update_formdata_image
                }).then((response) => response.json())
                    .then((result) => {
                        console.log(result);
                        document.getElementById("loading_rounder").classList.add("hidd")
                        if (result.code == 200) {
                            short_notification(result.detail, 5000);
                            document.getElementById("dashboard_profile_image_show").src = imag.target.result;
                            document.getElementById("dashboard_profile_image_link").href = `/media/${result.data.img_url}`;
                        }
                        else {
                            short_notification(result.detail, 5000);
                        }
                    });

                favi.href = "/static/icon/fav.svg";

            };
        }
    }

    document.getElementById("dashboard_profile_detail_update_btn").onclick = () => {
        favi.href = "/static/icon/favicon_offline.svg";
        document.getElementById("loading_rounder").classList.remove("hidd");
        updated_info = {}
        if (document.getElementById("dashboard_profile_detail_update_fname").value != "") {
            updated_info['fname'] = document.getElementById("dashboard_profile_detail_update_fname").value;
        }
        if (document.getElementById("dashboard_profile_detail_update_lname").value != "") {
            updated_info['lname'] = document.getElementById("dashboard_profile_detail_update_lname").value;
        }
        if (document.getElementById("dashboard_profile_detail_update_email").value != "") {
            updated_info['email'] = document.getElementById("dashboard_profile_detail_update_email").value;
        }
        if (document.getElementById("dashboard_profile_detail_update_mobile").value != "") {
            updated_info['mobile'] = document.getElementById("dashboard_profile_detail_update_mobile").value;
        }
        if (document.getElementById("dashboard_profile_detail_update_address").value != "") {
            updated_info['address'] = document.getElementById("dashboard_profile_detail_update_address").value;
        }
        if (document.getElementById("dashboard_profile_detail_update_pincode").value != "") {
            updated_info['pincode'] = document.getElementById("dashboard_profile_detail_update_pincode").value;
        }
        fetch("/api/profile/update/", {
            method: "POST",
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
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
                            document.getElementById(`dashboard_profile_detail_${k}`).innerText = updated_info[k];
                        }
                        document.getElementById("dashboard_profile_page_profile_detail").click();
                    }
                }
                else {
                    short_notification(result.detail, 5000);
                }
            });
        favi.href = "/static/icon/fav.svg";
    }


    // add task scripts

    document.getElementById("add_form_google_map").onclick = () => {
        initMap("googlemap_container", "add_form_gmap", "add_form_first_name");
        document.getElementById("map_popup").classList.remove("hidd");
    }

    document.getElementById("add_form_submit").onclick = () => {
        favi.href = "/static/icon/favicon_offline.svg";
        if (document.getElementById("add_form_tandcbx").checked) {
            let profile_img = document.getElementById("add_form_profile_img");
            let task_fname = document.getElementById("add_form_first_name");
            let task_lname = document.getElementById("add_form_last_name");
            let task_gender = "";
            if (document.getElementById("add_form_gender").checked) {
                task_gender = "Female";
            } else {
                task_gender = "Male";
            }
            let task_mobile = document.getElementById("add_form_mobile_number");
            let task_deadline = document.getElementById("add_form_deadline");
            let task_address = document.getElementById("add_form_address");
            let task_pincode = document.getElementById("add_form_pincode");
            let task_gmap = document.getElementById("add_form_gmap");


            let flag = 1;
            let errdenoter = "";

            if (profile_img.files.length <= 0) {
                flag = 0;
                document.getElementById('add_form_profile_img_selector').style.borderColor = "red";
                errdenoter += "enter message,&nbsp";
            } else {
                document.getElementById('add_form_profile_img_selector').style.borderColor = "#686868c0";
            }
            if (task_fname.value == "") {
                flag = 0;
                task_fname.style.borderColor = "red";
                errdenoter += "&nbspenter first name,&nbsp";
            } else {
                task_fname.style.borderColor = "#686868c0";
            }
            if (task_mobile.value == "") {
                flag = 0;
                task_mobile.style.borderColor = "red";
                errdenoter += "&nbspenter mobile number,&nbsp";
            } else if (task_mobile.value.length > 10 || task_mobile.value.length < 10) {
                flag = 0;
                task_mobile.style.borderColor = "red";
                errdenoter += "&nbspmobile number length should be 10,&nbsp";
            } else {
                task_mobile.style.borderColor = "#686868c0";
            }
            if (task_deadline.value == "") {
                flag = 0;
                task_deadline.style.borderColor = "red";
                errdenoter += "&nbspenter deadline for tasks,&nbsp";
            } else {
                task_deadline.style.borderColor = "#686868c0";
            }
            if (task_pincode.value == "") {
                flag = 0;
                task_pincode.style.borderColor = "red";
                errdenoter += "&nbsp enter pincode,&nbsp";
            } else {
                task_pincode.style.borderColor = "#686868c0";
            }
            if (task_address.value == "") {
                flag = 0;
                task_address.style.borderColor = "red";
                errdenoter += "&nbsp enter address,&nbsp";
            } else {
                task_address.style.borderColor = "#686868c0";
            }
            if (task_gmap.value == "") {
                flag = 0;
                document.getElementById("add_form_google_map").style.borderColor = "red";
                errdenoter += "&nbsp choose google map,&nbsp";
            } else {
                document.getElementById("add_form_google_map").style.borderColor = "#1667c4";
            }


            if (flag == 1) {

                document.getElementById('add_form_gender_text').value = task_gender;
                task_fname.value = task_fname.value + " " + task_lname.value;
                document.getElementById('add_form_deadline_timestp').value = new Date(document.getElementById('add_form_deadline').value).getTime();
                document.getElementById('add_submit').click();
                favi.href = "/static/icon/fav.svg";

            } else {
                short_notification(errdenoter, 10000);
                favi.href = "/static/icon/fav.svg";
            }

        } else {

            short_notification("please accept&nbsp;<b>terms and condition for add task</b>");
            favi.href = "/static/icon/fav.svg";
        }


    }

    document.getElementById("add_form_profile_img").onchange = () => {
        var fread = new FileReader();
        fread.readAsDataURL(document.getElementById("add_form_profile_img").files[0]);

        fread.onload = function (imag) {
            document.getElementById("add_form_profile_image_prv_default").style.display = "none";
            document.getElementById("add_form_profile_image_prv").classList.add('add-page-img');
            document.getElementById("add_form_profile_image_prv").classList.remove('hidd');
            document.getElementById("add_form_profile_image_prv").src = imag.target.result;
        };
    }

    document.getElementById("add_form_profile_img_selector").onclick = () => {
        document.getElementById("add_form_profile_img").click();
    }
    document.getElementById("add_form_add_proof_selector").onclick = () => {
        document.getElementById("add_form_add_proof_selector").innerText = "Proof selected"
        document.getElementById("add_form_add_proof").click();
    }
    document.getElementById("add_form_add_document_selector").onclick = () => {
        document.getElementById("add_form_add_document_selector").innerText = "Document selected"
        document.getElementById("add_form_add_document").click();
    }


    document.getElementById("map_popup_exit").onclick = () => {
        document.getElementById("map_popup").classList.add("hidd");
    }



    // pending task script



    document.getElementById("update_map_popup_exit").onclick = () => {
        document.getElementById("update_map_popup").classList.add("hidd");
    }

    document.getElementById("update_form_google_map").onclick = () => {
        initMap("update_googlemap_container", "update_form_gmap", "update_form_first_name");
        document.getElementById("update_map_popup").classList.remove("hidd");
    }

    document.getElementById("pending_task_list_btn").onclick = () => {
        document.getElementById("pending_list_popup").classList.remove("hidd");
    }

    document.getElementById("pending_list_popup_exit").onclick = () => {
        document.getElementById("loading_rounder").classList.remove("hidd");
        short_notification("Arranging details..", 5000);
        get_task_details();
        document.getElementById("pending_list_popup").classList.add("hidd");
        document.getElementById("loading_rounder").classList.add("hidd");
    }

    document.getElementById("pending_update_popup_exit").onclick = () => {
        document.getElementById("pending_update_popup").classList.add("hidd");
    }

    document.getElementById("pending_details_task_generate_otp_btn").onclick = () => {
        document.getElementById("loading_rounder").classList.remove("hidd");
        fetch('/api/task/gotp/', {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
            body: JSON.stringify({
                'pending_id': Number(pending_task_detail['selected_id'])
            })
        })
            .then((response) => response.json())
            .then((result) => {
                document.getElementById("loading_rounder").classList.add("hidd");
                console.log('Success:', result);
                if (result.code == 200) {
                    if (pending_task_detail['selected_id'] == String(result.data.pending_id)) {
                        short_notification(`<div><p>OTP :<b>${result.data.otp}</b>,otp for agent to cancel task :<b>${result.data.otp_cancel_agent}</b></p><i>"valid for only next 10 minutes"</i></div>`, 30000);
                    }
                } else if (result.code == 405) {
                    short_notification(result.detail, 5000);
                }
            })
            .catch((error) => {
                document.getElementById("loading_rounder").classList.add("hidd");
                short_notification(error, 5000);
            });


    }

    document.getElementById("pending_details_agent_remove_agent_btn").onclick = () => {
        document.getElementById("loading_rounder").classList.remove("hidd");
        fetch('/api/task/remove_agent/', {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') },
            body: JSON.stringify({
                'pending_id': Number(pending_task_detail['selected_id'])
            })
        })
            .then((response) => response.json())
            .then((result) => {
                console.log('Success:', result);
                document.getElementById("loading_rounder").classList.add("hidd");
                if (result.code == 200) {
                    if (pending_task_detail['selected_id'] == String(result.data.pending_id)) {
                        document.getElementById("pending_details_task_waiting").classList.remove("hidd");
                        document.getElementById("pending_details_task_accepted").classList.add("hidd");
                        document.getElementById("pending_details_agent_block").classList.add("hidd");
                    }
                    short_notification(result.detail, 5000);
                } else if (result.code == 405) {
                    short_notification(result.detail, 5000);
                }
            })
            .catch((error) => {
                document.getElementById("loading_rounder").classList.add("hidd");
                short_notification(error, 5000);
            });


    }



    //    runs when update button click
    document.getElementById("pending_task_update_btn_selector").onclick = () => {

        document.getElementById("loading_rounder").classList.remove("hidd");
        // arranging details

        let update_img_ele = document.createElement('a');
        update_img_ele.href = String(document.getElementById("pending_details_profile_image").src);
        document.getElementById('update_form_profile_image_prv').src = String(update_img_ele.pathname);
        document.getElementById('update_form_profile_image_prv').classList.add("add-page-img");

        let flnames = document.getElementById("pending_details_name").innerText.split(" ");
        if (pending_task_detail['selected_deadline_timestemp'] != 0) {
            document.getElementById("update_form_deadline").value = String(new Date((new Date(Number(pending_task_detail['selected_deadline_timestemp']))).getTime() - ((new Date(Number(pending_task_detail['selected_deadline_timestemp']))).getTimezoneOffset() * 60000)).toISOString().substring(0, 16));
        }

        document.getElementById("update_form_gmap").value = pending_task_detail['selected_map_letlong'];
        initMap("googlemap_container", "add_form_gmap", "add_form_first_name");
        document.getElementById("update_form_first_name").value = flnames[0];
        document.getElementById("update_form_last_name").value = flnames[1];
        document.getElementById("update_form_mobile_number").value = Number(document.getElementById("pending_details_task_mobile").innerText);
        document.getElementById("update_form_address").value = document.getElementById("pending_details_task_address").innerText;
        document.getElementById("update_form_pincode").value = document.getElementById("pending_details_task_pincode").innerText;
        document.getElementById("update_form_note").value = document.getElementById("pending_details_task_note").innerText;

        let update_proof_ele = document.createElement('a');
        update_proof_ele.href = String(document.getElementById("pending_details_task_proof_btn").href);
        update_proof_flag = update_proof_ele.pathname != "/media/profile/defaultprofile.png"
        if (update_proof_flag) {
            document.getElementById("update_form_add_proof_selector").classList.add("disabled-btn");
        } else {
            document.getElementById("update_form_add_proof_selector").classList.remove("disabled-btn");

        }

        let update_document_ele = document.createElement('a');
        update_document_ele.href = String(document.getElementById("pending_details_task_proof_btn").href);
        update_document_flag = update_document_ele.pathname != "/media/profile/defaultprofile.png"
        if (update_document_flag) {
            document.getElementById("update_form_add_document_selector").classList.add("disabled-btn")
        } else {
            document.getElementById("update_form_add_document_selector").classList.remove("disabled-btn")
        }


        document.getElementById("pending_update_popup").classList.remove("hidd");
        document.getElementById("loading_rounder").classList.add("hidd")
    }

    //    for priview in update box
    document.getElementById("update_form_profile_img").onchange = () => {
        document.getElementById("loading_rounder").classList.remove("hidd")
        let fread = new FileReader();
        fread.readAsDataURL(document.getElementById("update_form_profile_img").files[0]);

        fread.onload = function (imag) {
            document.getElementById("loading_rounder").classList.add("hidd")
            document.getElementById("update_form_profile_image_prv").classList.add('add-page-img');
            document.getElementById("update_form_profile_image_prv").classList.remove('hidd');
            document.getElementById("update_form_profile_image_prv").src = imag.target.result;
        };
    }

    document.getElementById("update_form_profile_img_selector").onclick = () => {
        document.getElementById("update_form_profile_img").click();
    };

    //    proof selector in update task
    document.getElementById("update_form_add_proof_selector").onclick = () => {
        document.getElementById("update_form_add_proof_selector").innerText = "Proof selected"
        document.getElementById("update_form_add_proof").click();
    }
    //    document selector in update task
    document.getElementById("update_form_add_document_selector").onclick = () => {
        document.getElementById("update_form_add_document_selector").innerText = "Document selected"
        document.getElementById("update_form_add_document").click();
    }

    // submit updated details for pending task
    document.getElementById("update_form_submit").onclick = () => {
        document.getElementById("pending_update_popup_exit").onclick();
        favi.href = "/static/icon/favicon_offline.svg";
        document.getElementById("loading_rounder").classList.remove("hidd")
        if (document.getElementById("update_form_tandcbx").checked) {
            document.getElementById('update_form_deadline_timestp').value = new Date(document.getElementById('update_form_deadline').value).getTime();

            let update_profile_img = document.getElementById("update_form_profile_img");
            let update_task_mobile = document.getElementById("update_form_mobile_number");
            let update_task_deadline = document.getElementById("update_form_deadline_timestp");
            let update_task_address = document.getElementById("update_form_address");
            let update_task_gmap = document.getElementById("update_form_gmap");
            let update_task_note = document.getElementById("update_form_note");








            let flag = 1;
            let errdenoter = "";

            if (update_task_mobile.value == "") {
                flag = 0;
                task_mobile.style.borderColor = "red";
                errdenoter += "&nbspenter valid mobile number,&nbsp";
            } else if (update_task_mobile.value.length > 10 || update_task_mobile.value.length < 10) {
                flag = 0;
                update_task_mobile.style.borderColor = "red";
                errdenoter += "&nbspmobile number length should be 10,&nbsp";
            } else {
                update_task_mobile.style.borderColor = "#686868c0";
            }
            //            if (Number(update_task_deadline.value) < pending_task_detail['selected_deadline_timestemp']) {
            //                flag = 0;
            //                update_task_deadline.style.borderColor = "red";
            //                errdenoter += "&nbspenter extended deadline for tasks,&nbsp";
            //            } else {
            //                update_task_deadline.style.borderColor = "#686868c0";
            //            }

            if (Number(update_task_deadline.value) <= (new Date()).getTime()) {
                flag = 0;
                update_task_deadline.style.borderColor = "red";
                errdenoter += "&nbspenter extended deadline for tasks,&nbsp";
            } else {
                update_task_deadline.style.borderColor = "#686868c0";
            }
            if (update_task_address.value == "") {
                flag = 0;
                update_task_address.style.borderColor = "red";
                errdenoter += "&nbsp enter address,&nbsp";
            } else {
                update_task_address.style.borderColor = "#686868c0";
            }
            if (update_task_gmap.value == "") {
                flag = 0;
                document.getElementById("update_form_google_map").style.borderColor = "red";
                errdenoter += "&nbsp choose google map,&nbsp";
            } else {
                document.getElementById("update_form_google_map").style.borderColor = "#1667c4";
            }


            if (flag == 1) {



                let update_formdata = new FormData()
                update_formdata.append("id", pending_task_detail['selected_id'])
                update_formdata.append("update_profile_img", update_profile_img.files[0])
                update_formdata.append("update_task_mobile", update_task_mobile.value)
                update_formdata.append("update_task_deadline", update_task_deadline.value)
                update_formdata.append("update_task_address", update_task_address.value)
                update_formdata.append("update_task_gmap", update_task_gmap.value)
                update_formdata.append("update_task_note", update_task_note.value)
                if (!update_document_flag) {
                    update_formdata.append("update_task_proof", document.getElementById("update_form_add_proof").files[0])
                }
                if (!update_proof_flag) {
                    update_formdata.append("update_task_document", document.getElementById("update_form_add_document").files[0])
                }

                fetch("/api/task/update/", {
                    method: "POST",
                    headers: { 'X-CSRFToken': getCookie('csrftoken') },
                    body: update_formdata
                }).then((response) => response.json())
                    .then((result) => {
                        console.log(result);
                        document.getElementById("loading_rounder").classList.add("hidd")
                    });

                favi.href = "/static/icon/fav.svg";

            } else {

                favi.href = "/static/icon/fav.svg";
                document.getElementById("loading_rounder").classList.add("hidd")
                short_notification(errdenoter, 10000);
            }

        } else {
            favi.href = "/static/icon/fav.svg";
            document.getElementById("loading_rounder").classList.add("hidd")
            short_notification("please accept&nbsp;<b>terms and condition for update task</b>");
        }

    }

    document.getElementById("pending_task_cancel_btn_selector").onclick = () => {
        document.getElementById("loading_rounder").classList.remove("hidd")
        if (pending_task_detail["selected_id"] != "") {
            pending_id = Number(pending_task_detail["selected_id"]);
            // let header = new Headers()
            fetch("/api/task/cancel/", {
                method: "POST",
                headers: { 'X-CSRFToken': getCookie('csrftoken') },
                // headers: header,
                body: JSON.stringify({
                    'pending_id': pending_id
                })
            }).then(res => res.json()).then((data) => {
                if (data.code == 200) {

                    let id = pending_task_detail["id"].splice(pending_task_detail["id"].indexOf(String(data.pending_id)), 1)
                    if (pending_task_detail['selected_id'] == id) {
                        if (pending_task_detail['id'].length > 0) {
                            document.getElementById("pending_task_empty_detail_container").innerText = "No tasks are selected"
                        } else {
                            document.getElementById("pending_task_empty_detail_container").innerText = "No tasks are assigned"
                            document.getElementById("pending_task_status_container").classList.add("hidd");
                        }
                        document.getElementById("pending_task_empty_detail_container").classList.remove("hidd");
                        document.getElementById("pending_task_detail_container").classList.add("hidd");
                    }
                    document.getElementById(`pending_task_selector_${id}`).remove();
                    document.getElementById("loading_rounder").classList.add("hidd")
                }
                else if (data.code == 401) {
                    short_notification(data.detail, 5000);
                }
                else if (data.code == 405) {
                    short_notification(data.detail, 5000);
                }
            })
        } else {
            document.getElementById("loading_rounder").classList.add("hidd")
            short_notification("please select any task to cancel it", 5000);
        }

    }




























    var message_socket = new WebSocket(`ws://${window.location.host}/ws/message/`);

    message_socket.onopen = (e) => {
        // send that socket is now connected as user mode
        message_socket.send(JSON.stringify({
            "typex": "register",
            "user_type": "user",
        }));
        short_notification("Connected to message server", 3000);

    }

    // pinging function to keep connection livey
    var pinging_message = setInterval(() => {
        
            message_socket.send(JSON.stringify({
                "typex": "ping",
                // "receiver_id" : message_details["user_selected"],
            }))
        
    }, 1000);


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

            if (document.getElementById("dashboard_page_message").style.display == "none") {
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






    var socket = new WebSocket(`ws://${window.location.host}/ws/expire/`);

    socket.onopen = (e) => {
        // send that socket is now connected as user mode
        socket.send("user")
        document.getElementById("sidemenu_profile").click();
        document.getElementById("loading_rounder").classList.add("hidd");
        short_notification("Connected", 3000);

    }

    // pinging function to keep connection live
    var pinging = setInterval(() => {
        socket.send("ping")
        console
    }, 3000)


    socket.onmessage = (e) => {

        data = JSON.parse(e.data);
        console.log(data);

        // it means this site is open in other window so keep this window close
        if (data.typex == 'session_expire') {
            clearInterval(pinging);
            short_notification(data.detail, 5000, `location.href = "/";`);
        }
        //it means new notification is arrive
        else if (data.typex == 'notification') {
            // document.getElementById("pending_task_detail_container").classList.add("hidd");
            if (Array.from(document.getElementById("pending_task_detail_container").classList).includes("hidd")) {
                document.getElementById("loading_rounder").classList.remove("hidd");
                document.getElementById("pending_task_empty_detail_container").classList.add("hidd");
                document.getElementById("pending_task_status_container").classList.remove("hidd");

                document.getElementById("pending_task_detail_container").classList.remove("hidd");
                if (pending_task_detail['selected_id'] != String(data.pending_id)) {
                    pending_task_detail['selected_id'] = String(data.pending_id)
                }
                get_task_details()
                document.getElementById("pending_list_popup").classList.add("hidd");
                document.getElementById("loading_rounder").classList.add("hidd");
            }

            short_notification(`${data.task_name}'s notification spreded among agents`, 5000);
        }
        // it means pending task is accepted
        else if (data.typex == "accepted") {

            if (document.getElementById("dashboard_page_pending").style.display == "none") {
                document.getElementById("sidemenu_pending").click();
            }
            if (pending_task_detail['selected_id'] != String(data.pending_id)) {
                pending_task_detail['selected_id'] = String(data.pending_id)
                document.getElementById("loading_rounder").classList.remove("hidd");
                get_task_details()
                document.getElementById("loading_rounder").classList.add("hidd");
            } else {

                // setup task accepted basic operation
                document.getElementById("pending_details_task_waiting").classList.add("hidd");
                document.getElementById("pending_details_task_accepted").classList.remove("hidd");
                document.getElementById("pending_details_agent_block").classList.remove("hidd");

                // steup agent image
                document.getElementById("pending_details_agent_profile_image").classList.remove("hidd");
                document.getElementById("pending_details_agent_default_profile_image").classList.add("hidd");
                document.getElementById("pending_details_agent_profile_image").src = `/media/${data.agent_image}`;
                document.getElementById("pending_details_agent_profile_image_link").href = `/media/${data.agent_image}`;

                document.getElementById("pending_details_agent_track_agent_btn").href = data.agent_location;
                document.getElementById("pending_details_agent_name").innerText = data.agent_name;
                document.getElementById("pending_details_agent_mobile").innerText = data.agent_mobile;
                document.getElementById("pending_details_agent_accepted_time").innerText = data.accepted_time;

                // setup icon for gender
                if (data.agent_xender == "Male") {
                    document.getElementById("pending_details_agent_gender_denoter").src = "/static/icon/boy.svg";

                } else {
                    document.getElementById("pending_details_agent_gender_denoter").src = "/static/icon/girl.svg";
                }
                document.getElementById("pending_details_agent_gender").innerText = data.agent_xender;

            }
            document.getElementById("pending_list_popup").classList.add("hidd");

            short_notification(`${data.task_name}'s task is accepted by ${data.agent_name}`, 5000,);
        } else if (data.typex == "updated") {
            if (pending_task_detail['selected_id'] == String(data.pending_id)) {
                received_data = JSON.parse(data.data);
                document.getElementById("loading_rounder").classList.remove("hidd");
                updated_str = "updated fields = "
                if (received_data.image) {
                    document.getElementById("pending_details_profile_image").src = `/media/${received_data.image}`;
                    document.getElementById("pending_details_profile_image").classList.remove("hidd");
                    document.getElementById("pending_details_default_profile_image").classList.add("hidd");
                    document.getElementById("pending_details_profile_image_link").href = `/media/${received_data.image}`;
                    updated_str += "image,"
                }
                if (received_data.address) {
                    document.getElementById("pending_details_task_address").innerText = received_data.address;
                    updated_str += "address"
                }
                if (received_data.mobile_number) {
                    document.getElementById("pending_details_task_mobile").innerText = received_data.mobile_number;
                    updated_str += "mobile number,"
                }
                if (received_data.note) {
                    document.getElementById("pending_details_task_note").innerText = received_data.note;
                    updated_str += "note,"
                }
                if (received_data.proof) {
                    document.getElementById("pending_details_task_proof_btn").href = `/media/${received_data.proof}`;
                    updated_str += "proof,"
                }
                if (received_data.document) {
                    document.getElementById("pending_details_task_document_btn").href = `/media/${received_data.document}`;
                    updated_str += "document,"
                }
                if (received_data.deadline) {
                    pending_task_detail['selected_deadline_intervals'].forEach((intervalobj) => {
                        clearInterval(intervalobj.interval);
                    });
                    generate_reverse_timer(Number(data.pending_id), received_data.deadline);
                    updated_str += "deadline,"
                }
                if (received_data.gmaplink) {
                    load_fixed_map(JSON.parse(received_data.gmaplink), "pending_details_map_container")
                    updated_str += "google map,"
                }
                document.getElementById("loading_rounder").classList.add("hidd");
                short_notification(updated_str, 5000);

                console.log(received_data);
            }
        }
        // it means pending task is expire(not accepted tasks)
        else if (data.typex == "expire") {
            let id = pending_task_detail["id"].splice(pending_task_detail["id"].indexOf(String(data.pending_id)), 1)
            if (pending_task_detail['selected_id'] == id) {
                if (pending_task_detail['id'].length > 1) {
                    document.getElementById("pending_task_empty_detail_container").innerText = "No tasks are selected"
                } else {
                    document.getElementById("pending_task_empty_detail_container").innerText = "No tasks are assigned"
                    document.getElementById("pending_task_status_container").classList.add("hidd");
                }
                document.getElementById("pending_task_empty_detail_container").classList.remove("hidd");
                document.getElementById("pending_task_detail_container").classList.add("hidd");
                document.getElementById("pending_task_controller_container").classList.add("hidd");
            }
            document.getElementById(`pending_task_selector_${id}`).remove();
            let gender_expired, accepted_expired;
            if (data.gender == "Male") {
                gender_expired = "male_symbol.svg";
            } else {
                gender_expired = "female_symbol.svg";
            }
            if (data.accepted == "accepted") {
                accepted_expired = "true_round.svg";
            } else {
                accepted_expired = "false_round.svg";
            }
            document.getElementById("completed_page_part_expired").innerHTML += `
                                
                                <div class="completed-page-expired-task-detail">
                                    <img class="completed-page-expired-task-detail-profile-img"
                                        src="/static/icon/user_img.svg" alt="">
                                    <div class="completed-page-expired-task-detail-name">
                                        ${data.task_name}</div>
                                    <img class="completed-page-expired-task-detail-gender"
                                        src="/static/icon/${gender_expired}" alt="">
                                    <div class="completed-page-expired-task-detail-mobile">
                                        ${data.mobile_number}</div>
                                    <img class="completed-page-expired-task-detail-accept"
                                        src="/static/icon/${accepted_expired}" alt="">
                                    <div class="completed-page-expired-task-detail-refid">
                                        ${data.task_id}</div>
                                    <div class="completed-page-expired-task-detail-select-btn-outer-container">
                                        <div class="completed-page-expired-task-detail-select-btn"
                                            id="completed_page_completed_task_${data.task_id}">
                                            Select</div>
                                    </div>
                                </div>
            `;

            completed_task_detail['completed_ids'].push(String(data.task_id));

            completed_task_select_listener()

            short_notification(`${data.task_name}'s task is expired`, 5000);
        } else if (data.typex == "cancelled") {
            let gender, refund_status, accepted;
            if (data.gender == "Male") {
                gender = "male_symbol.svg";
            } else {
                gender = "female_symbol.svg";
            }
            if (data.refund_status == "pending") {
                refund_status = "pending_round.svg";
            } else {
                refund_status = "true_round.svg";
            }
            if (data.accepted == "accepted") {
                accepted = "true_round.svg";
            } else {
                accepted = "false_round.svg";
            }
            document.getElementById("completed_page_part_cancelled").innerHTML += `
            <div class="completed-page-cancelled-task-detail">
                <img class="completed-page-cancelled-task-detail-profile-img"
                    src="/media/${data.image}" alt="">
                <div class="completed-page-cancelled-task-detail-name">
                    ${data.name}</div>
                    <div class="completed-page-cancelled-task-detail-mobile">
                        ${data.mobile_number}</div>
                        
                <img class="completed-page-cancelled-task-detail-gender"
                    src="/static/icon/${gender}" alt="">
        
                <img class="completed-page-cancelled-task-detail-refund"
                    src="/static/icon/${refund_status}" alt="">

                <img class="completed-page-cancelled-task-detail-accept"
                    src="/static/icon/${accepted}" alt="">
                
                <div class="completed-page-cancelled-task-detail-refid">
                    ${data.task_id}</div>
                <div class="completed-page-cancelled-task-detail-select-btn-outer-container">
                    <div class="completed-page-cancelled-task-detail-select-btn"
                        id="completed_page_completed_task_${data.task_id}">
                        Select</div>
                </div>
            </div>
            `;
            completed_task_detail['completed_ids'].push(String(data.task_id));

            completed_task_select_listener();

            short_notification(`Task cancelled please see details in task history.`, 5000);
        }
        else if (data.typex == "remove_accepted_task") {
            if (pending_task_detail['selected_id'] == String(data.pending_id)) {
                document.getElementById("pending_details_task_waiting").classList.remove("hidd");
                document.getElementById("pending_details_task_accepted").classList.add("hidd");
                document.getElementById("pending_details_agent_block").classList.add("hidd");
            }
            short_notification("task is droped by agent", 5000);
        }
        // it means task is completed successfully
        else if (data.typex == "completed") {
            let id = pending_task_detail["id"].splice(pending_task_detail["id"].indexOf(String(data.pending_id)), 1)
            if (pending_task_detail['selected_id'] == id) {
                if (pending_task_detail['id'].length > 1) {
                    document.getElementById("pending_task_empty_detail_container").innerText = "No tasks are selected"
                } else {
                    document.getElementById("pending_task_empty_detail_container").innerText = "No tasks are assigned"
                    document.getElementById("pending_task_status_container").classList.add("hidd");
                }
                document.getElementById("pending_task_empty_detail_container").classList.remove("hidd");
                document.getElementById("pending_task_detail_container").classList.add("hidd");
            }
            document.getElementById(`pending_task_selector_${id}`).remove();

            let gender;
            if (data.gender == "Male") {
                gender = "male_symbol.svg";
            } else {
                gender = "female_symbol.svg";
            }
            document.getElementById("completed_page_part_completed").innerHTML += `
            <div class="completed-page-completed-task-detail" >
                <img class="completed-page-completed-task-detail-profile-img"
                    src="/static/icon/user_img.svg" alt="">
                <div class="completed-page-completed-task-detail-name">
                    ${data.task_name}</div>
                <img class="completed-page-completed-task-detail-gender"
                    src="/static/icon/${gender}" alt="">
                <div class="completed-page-completed-task-detail-mobile">
                    ${data.mobile_number}</div>
                <div class="completed-page-completed-task-detail-refid">
                    ${data.task_id}</div>
                <div class="completed-page-completed-task-detail-select-btn-outer-container">
                    <div class="completed-page-completed-task-detail-select-btn"
                        id="completed_page_completed_task_${data.task_id}">
                        Select</div>
                </div>
            </div>
            `;

            completed_task_detail['completed_ids'].push(`${data.task_id}`);

            completed_task_select_listener();

            short_notification(`${data.task_name}'s task is completed by ${data.agent_name}`, 5000);
        }
    }
    window.onbeforeunload = function (event) {
        socket.close()
        message_socket.close();
        return null;
    };
    socket.onclose = (e) => {
        console.log('disconnect live connection');
    }




    // completed page js


    completed_task_detail['page_part_list'].forEach((selector) => {
        document.getElementById(`completed_page_part_selector_${selector}`).onclick = () => {
            console.log("completed page changed");
            document.getElementById("page_loading_rounder").classList.remove("hidd");
            completed_task_detail['page_part_list'].forEach((selectorx) => {
                document.getElementById(`completed_page_part_selector_${selectorx}`).style.borderColor = "transparent";
                document.getElementById(`completed_page_part_selector_${selectorx}`).style.color = "black";
                document.getElementById(`completed_page_part_${selectorx}`).classList.add("hidd");
            })
            document.getElementById(`completed_page_part_selector_${selector}`).style.borderColor = "#1E75D9";
            document.getElementById(`completed_page_part_selector_${selector}`).style.color = "#175aa7";
            document.getElementById(`completed_page_part_${selector}`).classList.remove("hidd");
            // deselect id process
            completed_task_detail['completed_selected_id'] = "";
            document.getElementById("completed_page_more_detail_btn_container").classList.add("hidd");
            completed_task_detail['completed_ids'].forEach((idx) => {
                document.getElementById(`completed_page_completed_task_${idx}`).style.backgroundColor = "transparent";
                document.getElementById(`completed_page_completed_task_${idx}`).style.border = "2px solid #1E75D9";
                document.getElementById(`completed_page_completed_task_${idx}`).innerText = "Select";
                document.getElementById(`completed_page_completed_task_${idx}`).style.color = "#1E75D9";
            });
            if (selector == "completed") {
                document.getElementById("completed_page_detail_part_selector_refund_info").classList.add("hidd");
            } else if (selector == "expired") {
                document.getElementById("completed_page_detail_part_selector_refund_info").classList.remove("hidd");

            } else if (selector == "cancelled") {
                document.getElementById("completed_page_detail_part_selector_refund_info").classList.remove("hidd");

            }
            document.getElementById("page_loading_rounder").classList.add("hidd");
        }
    })

    document.getElementById("completed_task_more_detail").onclick = () => {
        if (completed_task_detail["completed_selected_id"] != "") {
            document.getElementById("loading_rounder").classList.remove("hidd");
            console.log("getinfo for", completed_task_detail["completed_selected_id"]);
            get_completed_task_details();
            document.getElementById("completed_detail_popup").classList.remove("hidd");
            document.getElementById("loading_rounder").classList.add("hidd");
        } else {
            short_notification("please select any task from completed task page", 5000);
        }
    }
    document.getElementById("completed_detail_popup_exit").onclick = () => {
        document.getElementById("completed_detail_popup").classList.add("hidd");
    }
    document.getElementById("completed_task_query").onclick = () => {
        if (completed_task_detail["completed_selected_id"] != "") {
            console.log("query for", completed_task_detail["completed_selected_id"]);
        } else {
            short_notification("please select any task from completed task page", 5000);
        }
    }

    completed_task_detail['detail_page_part_list'].forEach((selector) => {
        document.getElementById(`completed_page_detail_part_selector_${selector}`).onclick = () => {
            completed_task_detail['detail_page_part_list'].forEach((selectorx) => {
                console.log(selectorx);
                document.getElementById(`completed_page_detail_part_selector_${selectorx}`).style.borderColor = "transparent";
                document.getElementById(`completed_page_detail_part_selector_${selectorx}`).style.color = "gray";
                document.getElementById(`completed_detail_popup_detail_container_${selectorx}`).classList.add("hidd");
            })
            document.getElementById(`completed_page_detail_part_selector_${selector}`).style.borderColor = "black";
            document.getElementById(`completed_page_detail_part_selector_${selector}`).style.color = "black";
            document.getElementById(`completed_detail_popup_detail_container_${selector}`).classList.remove("hidd");

        }
    })





















    document.getElementById("pending_details_task_accepted").onclick = () => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
        console.log("aggent detail grabed");
    }
    document.getElementById("backtohome").onclick = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }



}