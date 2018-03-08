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
document.querySelector("#username-signup").addEventListener("keyup",(e)=>{
    let status=document.querySelector("#username-status");
    let username=e.target.value;
    status.innerHTML="";
    if(username!=""){
    status.innerHTML="Checking...";
    useravail=false;
    ajaxreq("GET","/checkavailuser/"+username,()=>{
    status.innerHTML="✔ Username available";
    status.style.background="#9c9";
    useravail=true;
    },()=>{
    status.innerHTML="❌ Username unavailable, choose another";status.style.background="#c99";
    useravail=false;
    });
    }
});
document.querySelector("#password-signup-repeat").addEventListener("keyup",(e)=>{
    if(e.target.value==document.querySelector("#password-signup").value){
        document.querySelector("#password-status").innerHTML="Passwords matched";
        if(useravail){
            document.querySelector("#sign-up-form button").disabled=false;
        }
    }
    else{
        document.querySelector("#password-status").innerHTML="Passwords doesn't match";
    }
})