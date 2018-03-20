let auth_user=null;
ajaxreq("get","/checkloggedin",(result)=>{
auth_user=JSON.parse(result).user;
document.querySelector(".login-area").style.display="none";document.querySelector(".logged-in-area").style.display="flex";
document.querySelector("#usericon").innerHTML="🙍‍ "+JSON.parse(result).username;
document.querySelector("#usericon").href="/"+JSON.parse(result).username;
document.querySelector("#usericon").setAttribute('data-userid',auth_user);
document.querySelector("#usericon").addEventListener("click",userpage);
document.querySelector("#trending-polls").style.display="block";
document.querySelector(".create-polls").style.display="block";
showtrending(document.querySelector("#trending-polls"));
},()=>{
    document.querySelector(".loader-bg").style.display="none";
});
function showtrending(container){
    ajaxreq("get","/trending-polls",(result)=>{
        document.querySelector(".loader-bg").style.display="none";
        let child="<h3>Popular Polls</h3>";
        result=JSON.parse(result);
        showpolls(result,container,child);
    },()=>{
        container.innerHTML="<h3>Error getting data!!</h3>";
    });
}
function showpolls(result,container,child){
    result.forEach((item)=>{
        let question=item.question;
        let options=item.options;
        let createdBy=item.createdBy;
        let id=item["_id"];
        child+="<div class='poll'><b>"+question+"</b>";
        child+="<form action='/vote' method='post'><div class='options'>";
        child+="<input type='hidden' name='id' value='"+id+"'/>";
        for(option of options){
            child+="<div class='option'><input type='radio' name='poll' value='"+option.value+"'/><span class='option-val'>"+option.value+"</span></div>";
        }
        child+="</div><button class='btn btn-green' type='submit'>Vote</button></form>";
        child+="</div>";
    });
    container.innerHTML=child;
}
function signout(){
    window.location.replace('/signout');
}
function createPoll(){
    document.querySelector("#poll-submit-auth").value=auth_user;
    if(document.querySelector("#question-to-submit").value.endsWith("?")){
        return true;
    }
    else{
        alert("Invalid question type.\nPlease put a question-mark at the end.");
        return false;
    }
    return false;
}
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
    callback1(this.responseText);
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
        ajaxreq("GET","/checkavailuser/"+username,(result)=>{
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
document.querySelector("#hamburger-menu-btn").addEventListener("click",(e)=>{
    if(document.querySelector(".hamburger-menu")){       
    document.querySelector(".main-content").style.margin="100px 0px 0px 0px";
    document.querySelector(".hamburger-menu").className="hamburger-menu-hidden";
    }
    else{
    document.querySelector(".hamburger-menu-hidden").className="hamburger-menu";
    document.querySelector(".main-content").style.margin="100px 0px 0px 200px";
    }
});
