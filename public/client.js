function show(area){
    let obj=document.getElementById(area);
    obj.className="qvisible";
    document.querySelector(".bg-layer").style.visibility="visible";
    document.querySelectorAll(".qvisible").forEach((elem)=>{
        if(elem!=obj){
            elem.className="hidden";
        }
    });
}
function focusto(elem){
    let obj=document.getElementById(elem);
    obj.focus();
}
document.querySelectorAll(".close-btn").forEach((elem)=>{
    elem.addEventListener("click",(e)=>{
    let obj=e.target.parentNode;
    obj.className="hidden";
    document.querySelector(".bg-layer").style.visibility="hidden";
})
});
document.querySelector(".bg-layer").addEventListener("click",(e)=>{
    document.querySelectorAll(".qvisible").forEach((elem)=>{
            elem.className="hidden";
    });
    e.target.style.visibility="hidden";
});
function ajaxreq(method,url,callback1,callback2){
    let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
    callback1();
    }
    else if(this.readyState==4&&this.status!=200){
    callback2();
    }
  };
  xhttp.open(method, url, true);
  xhttp.send();
}
let useravail=false;
let passmatch=false;
document.querySelectorAll("#sign-up-form input").forEach((elem)=>{
    elem.addEventListener("keyup",(e)=>{
    document.querySelector("#sign-up-form button").disabled=true;
    let target=e.target;
    if(target==document.querySelector("#username-signup")){
        useravail=false;
        useravail1(target.value);
    }
    else if(target==document.querySelector("input#password-signup-repeat")){
        passmatch=false;
        passmatch1(target.value);
    }

    //functions
    function useravail1(username){
        let status=document.querySelector("#username-status");
        status.innerHTML="";
        if(username!=""){
        status.innerHTML="Checking...";
        ajaxreq("GET","/checkavailuser/"+username,()=>{
        status.innerHTML="✅ Username available";
        status.style.background="#9c9";
        useravail=true;
        enablesignupbtn();
        },()=>{
        status.innerHTML="❌ Username unavailable, choose another";status.style.background="#c99";
        enablesignupbtn();
        });
        }
    }
    function passmatch1(password){
        if(password==document.querySelector("#password-signup").value){
            document.querySelector("#password-status").innerHTML="✅ Passwords matched";
            passmatch=true;
        }
        else{
            document.querySelector("#password-status").innerHTML="❌ Passwords doesn't match";
        }
        enablesignupbtn();
    }
    function enablesignupbtn(){
        if(useravail==true&&passmatch==true){
            document.querySelector("#sign-up-form button").disabled=false;
        }
    }
});
});
