function short_notification(texts = "notification", timex = 5000, action = "") {
    document.getElementById("notificationbx").style.display = "block";
    document.getElementById("notif_name").innerHTML = texts;
    setTimeout(() => {
        document.getElementById("notif_name").style.bottom = "10px";
    }, 100);
    setTimeout(() => {
        document.getElementById("notif_name").style.bottom = "-500px";
    }, timex + 100);
    setTimeout(() => {
        document.getElementById("notificationbx").style.display = "none";
        eval(action);
    }, timex + 200);
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


window.onload = () => {

    var favi = document.querySelector("link[rel~='icon']");
    if (!localStorage.getItem('contact_messages')) {
        localStorage.setItem("contact_messages", 1);
    }

    window.onscroll = () => {
        if (document.body.scrollTop > 40 || document.documentElement.scrollTop > 40) {
            document.getElementById("navbar").className = "stickynav";
        } else {
            document.getElementById("navbar").className = "navbar";
        }
        if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
            document.getElementById("backtohome").style.visibility = "visible";
        } else {
            document.getElementById("backtohome").style.visibility = "hidden";
        }
    }

    document.getElementById("backtohome").onclick = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    document.getElementById("contactus_submit").onclick = () => {
        favi.href = "/static/icon/favicon_offline.svg";
        if (localStorage.getItem('contact_messages')) {
            if (Number(localStorage.getItem('contact_messages')) > 20) {
                short_notification("<b>you are not elegible for more message please contact us directly.</b>");
            } else {
                localStorage.setItem("contact_messages", Number(localStorage.getItem('contact_messages')) + 1);
                
                let contactus_fname = document.getElementById("contactus_fname");
                let contactus_lname = document.getElementById("contactus_lname");
                let contactus_email = document.getElementById("contactus_email");
                let contactus_mobile = document.getElementById("contactus_mobile");
                let contactus_message = document.getElementById("contactus_message");
                let flag = 1;
                let errdenoter = "";
                if (contactus_fname.value == "") {
                    flag = 0;
                    contactus_fname.style.borderColor = "red";
                    errdenoter += "&nbspenter first name,&nbsp";
                    // short_notification("<b>enter first name</b>");
                } else {
                    contactus_fname.style.borderColor = "#686868c0";
                }
                if (contactus_lname.value == "") {
                    flag = 0;
                    contactus_lname.style.borderColor = "red";
                    errdenoter += "&nbspenter last name,&nbsp";
                    // short_notification("<b>enter last name</b>");
                } else {
                    contactus_lname.style.borderColor = "#686868c0";
                }
                if (contactus_email.value == "") {
                    flag = 0;
                    contactus_email.style.borderColor = "red";
                    errdenoter += "&nbspenter email address,&nbsp";
                    // short_notification("<b>enter email address</b>");
                } else {
                    contactus_email.style.borderColor = "#686868c0";
                }
                if (contactus_message.value == "") {
                    flag = 0;
                    contactus_message.style.borderColor = "red";
                    errdenoter += "&nbsp enter message,&nbsp";
                    // short_notification("<b>enter message</b>");
                } else {
                    contactus_message.style.borderColor = "#686868c0";
                }
        
                console.log(flag)
                if (flag == 1) {
                    fetch('/api/contactus/', {
                            method: 'POST',
                            headers : {'X-CSRFToken' : getCookie('csrftoken')},
                            body: JSON.stringify({
                                "first_name": contactus_fname.value,
                                "last_name": contactus_lname.value,
                                "email_address": contactus_email.value,
                                "mobile_number": contactus_mobile.value,
                                "message": contactus_message.value
                            })
                        })
                        .then((response) => response.json())
                        .then((result) => {
                            favi.href = "/static/icon/fav.svg";
                            if (result.code == 200) {
                                short_notification("message recorded successfully", 5000);
                            } else if (result.code == 404) {
                                short_notification(`${result.detail}`, 3000);
                            } else if (result.code == 405) {
                                short_notification(`${result.detail}`, 3000);
                            } else if (result.code == 406) {
                                short_notification(`${result.detail}`, 3000);
                            }
                        })
                        .catch((error) => {
                            favi.href = "/static/icon/fav.svg";
                            short_notification(`<b>${error}</b>`);
                        });
                }
                else
                {
                    short_notification(errdenoter,7000);
                }
            }
        }
    }


}