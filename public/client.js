let auth_user=null;
if(document.getElementById("usericon")){
auth_user=document.getElementById("usericon").getAttribute("data-userid");
console.log(auth_user);
}
else{
auth_user=null;
}
function showtrending(container,username){
    ajaxreq("get","/trending-polls",(result)=>{
        document.querySelector(".loader-bg").style.display="none";
        let child="<h3>Popular Polls</h3>";
        result=JSON.parse(result);
        showpolls(result,container,child,username);
    },()=>{
        container.innerHTML="<h3>Error getting data!!</h3>";
    });
}
function showpolls(result,container,child,username){
    result.forEach((item)=>{
        let question=item.question;
        let options=item.options;
        let createdBy=item.createdBy;
        let id=item["_id"];
        child+="<div class='poll' id='"+id+"'><i style='color:#666'>👤 "+createdBy+"</i> &nbsp; <i style='color:#558'>@"+item.at+"</i><hr/><b>"+question+"</b>";
        child+="<form action='/vote' method='post'><div class='options'>";
        child+="<input type='hidden' name='id' value='"+id+"'/>";
        for(option of options){
            child+="<div class='option'><input type='radio' name='poll' value='"+option.value+"'/><span class='option-val'>"+option.value+"</span></div>";
        }
        child+="</div><div><button class='btn btn-green' type='submit'>Vote</button> ";
        if(createdBy===username){
            child+="<a href='javascript:console.log();' onclick='deletePoll(event)' class='btn btn-red' data-id='"+id+"'>Delete</a> ";
        }
        child+="<a class='btn btn-blue' href='javascript:console.log();' data-results='"+JSON.stringify(options)+"' data-title='"+question+"' type='reset' onclick='showresult(event)'>Show Result</a>";
        child+="</div></form></div>";
    });
    container.innerHTML=child;
}
function deletePoll(e){
    let poll_id=e.target.getAttribute("data-id");
    let r = confirm("Are you sure you want to delete!");
    if (r == true) {
        e.target.innerHTML="Deleting...";
        ajaxreq("get","/deletepoll?id="+poll_id+"&userid="+auth_user,(result)=>{
            let delem=document.getElementById(poll_id);
            delem.parentElement.removeChild(delem);
            console.log("deleted:"+poll_id);
        },()=>{});
    }
}
function signout(){
    window.location.replace('/signout');
}
function createPoll(){
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
function showresult(e){
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
      let values=[
        ['Option', 'Votes']
      ];
      let result_votes=JSON.parse(e.target.getAttribute('data-results'));
      for(vote of result_votes){
          values.push([vote.value,vote.votes]);
      }
      let data = google.visualization.arrayToDataTable(values);
      let options = {
        title: e.target.getAttribute('data-title'),
        is3D: true,
      };

      let chart = new google.visualization.PieChart(document.getElementById('piechart'));

      chart.draw(data, options);
    }
        show("chart");
}