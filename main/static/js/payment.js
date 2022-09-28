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
    // document.getElementById("gmaplink").href =`https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${JSON.parse(gmap).lat},${JSON.parse(gmap).lng}&output=embed`;




    var verifyed_details = 0;
    let dat = new Date(Number(deadline_timestemp))
    document.getElementById("task_deadline").innerText = dat;



    document.getElementById("verify").onclick = () => {
        if (verifyed_details == 0) {
            verifyed_details = 1;
            console.log("verified")
            document.getElementById("verify").innerText = "Verifyed";
            document.getElementById("verify").style.backgroundColor = "gray";
            document.getElementById("verify").style.color = "black";
            alert("please note both payment id and task id. without it we will not help you.");
        }
    }

    document.getElementById('pay').onclick = () => {
        if (verifyed_details == 1) {
            document.getElementById("loading_box").style.display = "block";
            const request = new Request(
                '/api/task/payment/',
                {headers: {'X-CSRFToken': getCookie("csrftoken")}}
            );
            fetch(request, {
                method: 'POST',
                mode: 'same-origin',
                body: JSON.stringify({"payment_id" : payment_id })
            })
                .then((response) => response.json())
                .then((result) => {
                    document.getElementById('loading_box').style.display = "none";
                    if (result.code == 200) {
                        document.getElementById("success_box").style.display = "block";
                        setTimeout(() => {
                            document.getElementById("success_box").style.display = "none";
                            location.href = "/";
                        }, 2000);
                    }
                    else {
                        document.getElementById("message_text").innerText = result.detail;
                        document.getElementById("messsage_box").style.display = "block";
                        setTimeout(() => {
                            document.getElementById("messsage_box").style.display = "none";
                        }, 1000);

                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                    document.getElementById("message_text").innerText = error;
                    document.getElementById("messsage_box").style.display = "block";
                    setTimeout(() => {
                        document.getElementById("messsage_box").style.display = "none";
                    }, 1000);
                });
            document.paytm.submit()
        }
        else {
            document.getElementById("message_text").innerText = "verify your details first";
            document.getElementById("messsage_box").style.display = "block";
            setTimeout(() => {
                document.getElementById("messsage_box").style.display = "none";
            }, 1000);

        }
    }

    document.getElementById('discard').onclick = () => {
        if (verifyed_details == 1) {
            document.getElementById("loading_box").style.display = "block";
            fetch('/api/task/delete/', {
                method: 'POST',
                headers : {'X-CSRFToken' : getCookie('csrftoken')},
                body: JSON.stringify({"task_id" : task_id })
            })
                .then((response) => response.json())
                .then((result) => {
                    document.getElementById('loading_box').style.display = "none";
                    if (result.code == 200) {
                        document.getElementById("message_text").innerText = "your data is successfully deleted.";
                        document.getElementById("messsage_box").style.display = "block";
                        setTimeout(() => {
                            document.getElementById("messsage_box").style.display = "none";
                        }, 3000);
                        location.href = "/"
                        
                    }
                    else {
                        document.getElementById("message_text").innerText = result.detail;
                        document.getElementById("messsage_box").style.display = "block";
                        setTimeout(() => {
                            document.getElementById("messsage_box").style.display = "none";
                        }, 3000);

                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                    document.getElementById("message_text").innerText = error;
                    document.getElementById("messsage_box").style.display = "block";
                    setTimeout(() => {
                        document.getElementById("messsage_box").style.display = "none";
                    }, 2000);
                });

        }
        else {
            document.getElementById("message_text").innerText = "verify your details first";
            document.getElementById("messsage_box").style.display = "block";
            setTimeout(() => {
                document.getElementById("messsage_box").style.display = "none";
            }, 1000);

        }
    }
}