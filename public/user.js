function userpage(e){
    let user_id=e.target.getAttribute('data-userid');
    console.log("loading userpage");
    document.querySelector(".main-content").innerHTML="<div class='loader loader10'></div>";
    ajaxreq("GET","/user/"+user_id,(result)=>{
        document.querySelector(".main-content").innerHTML=result;
    },()=>{
        alert("error");
    })
}