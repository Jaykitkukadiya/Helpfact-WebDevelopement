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
    let cookieValue = null;``
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

    document.getElementById("forgot_box_btn").onclick = () => {
        document.getElementById("login_box").style.display = "none";
        document.getElementById("signup_box").style.display = "none";
        document.getElementById("forgot_box").style.display = "flex";
    }
    document.getElementById("signup_go_btn").onclick = () => {
        document.getElementById("forgot_box").style.display = "none";
        document.getElementById("login_box").style.display = "none";
        document.getElementById("signup_box").style.display = "flex";
    }
    document.getElementById("login_go_btn").onclick = () => {
        document.getElementById("forgot_box").style.display = "none";
        document.getElementById("signup_box").style.display = "none";
        document.getElementById("login_box").style.display = "flex";
    }
    document.getElementById("reset_cancel_btn").onclick = () => {
        document.getElementById("signup_box").style.display = "none";
        document.getElementById("forgot_box").style.display = "none";
        document.getElementById("login_box").style.display = "flex";
    }
    
    document.getElementById("reset_mail_btn").onclick = () => {
        favi.href="/static/icon/favicon_offline.svg";
        short_notification("please wait while we processing...");
        let email = document.getElementById("reset_mail");
        if(email.value.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) )
        {
            email.style.color = "black";
            console.log("valid");
            fetch('/api/forgotpassword/', {
            method: 'POST',
            headers : {'X-CSRFToken' : getCookie('csrftoken')},
            body: JSON.stringify({
                "email": email.value,
            })
            })
            .then((response) => response.json())
            .then((result) => {
                favi.href="/static/icon/fav.svg";
                if (result.code == 200) {
                    short_notification("reset link has been sent to your email address.", 1000);                    
                } else if (result.code == 404) {
                    short_notification(`${result.detail}`, 3000);
                } else if (result.code == 405) {
                    short_notification(`${result.detail}`, 3000);
                } else if (result.code == 406) {
                    short_notification(`${result.detail}`, 3000);
                }
            })
            .catch((error) => {
                favi.href="/static/icon/fav.svg";
                short_notification(`<b>${error}</b>`);
            });
        }
        else{
            short_notification("Invalid email address");
            email.style.color = "red";
            email.focus();
        }
        
           
    }
    document.getElementById("login_btn").onclick = () => {
        favi.href="/static/icon/favicon_offline.svg";
        if (document.getElementById("tandcbx_login").checked) {
            let username = document.getElementById("username").value;
            let password = document.getElementById("password").value;
            fetch('/api/login/', {
                method: 'POST',
                headers : {'X-CSRFToken' : getCookie('csrftoken')},
                body: JSON.stringify({
                    "username": username,
                    "password": password
                })
                })
                .then((response) => response.json())
                .then((result) => {
                    favi.href="/static/icon/fav.svg";
                    if (result.code == 200) {
                        short_notification("login successful", 3000, "location.href ='/'");
                    } else if (result.code == 404) {
                        short_notification(`${result.detail}`, 3000);
                    } else if (result.code == 405) {
                        short_notification(`${result.detail}`, 3000);
                    } else if (result.code == 406) {
                        short_notification(`${result.detail}`, 3000);
                    }
                })
                .catch((error) => {
                    favi.href="/static/icon/fav.svg";
                    short_notification(`<b>${error}</b>`);
                });
            } else {
            favi.href="/static/icon/fav.svg";
            short_notification("please accept&nbsp;<b>terms and condition for login</b>");
        }
    }



    document.getElementById("signup_btn").onclick = () => {
        favi.href="/static/icon/favicon_offline.svg";
        if (document.getElementById("tandcbx_signup").checked) {
            let username = document.getElementById("signup_username").value;
            let password = document.getElementById("signup_password").value;
            let email = document.getElementById("signup_email").value;
            let mobile = document.getElementById("signup_mobile").value;
            let address = document.getElementById("signup_address").value;
            let pincode = document.getElementById("signup_pincode").value;
            fetch('/api/signup/', {
                method: 'POST',
                headers : {'X-CSRFToken' : getCookie('csrftoken')},
                body: JSON.stringify({
                    "username": username,
                    "password": password,
                    "email": email,
                    "mobile": mobile,
                    "address": address,
                    "pincode": pincode
                })
            })
            .then((response) => response.json())
            .then((result) => {
                    favi.href="/static/icon/fav.svg";
                    if (result.code == 200) {
                        short_notification("signup successful", 3000, "location.href ='/login'");
                    } else if (result.code == 404) {
                        short_notification(`${result.detail}`, 3000);
                    } else if (result.code == 405) {
                        short_notification(`${result.detail}`, 3000);
                    } else if (result.code == 406) {
                        short_notification(`${result.detail}`, 3000);
                    }
                    console.log(result);
                })
                .catch((error) => {
                    favi.href="/static/icon/fav.svg";
                    console.log(error);
                    short_notification(`<b>${error}</b>`);
                });
            } else {
            favi.href="/static/icon/fav.svg";
            short_notification("please accept&nbsp;<b>terms and condition for signup</b>");
        }
    }
}