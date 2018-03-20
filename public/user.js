function userpage(e){
    let user_id=e.target.getAttribute('data-userid');
    console.log("loading userpage");
    document.querySelector(".main-content").innerHTML="<div class='loader loader10'></div>";
    ajaxreq("GET","/user/"+user_id,(result)=>{
        result=JSON.parse(result);
        let toRender=`<div class='userpage'>
           <h1>${result.username}</h1>
           <div class='polls' id='pollsbyuser'></div> 
        </div>`;
        document.querySelector(".main-content").innerHTML=toRender;
        document.querySelector(".polls").style.display="block";
        showpolls(result.polls.reverse(),document.querySelector(".main-content #pollsbyuser"),"<h3>All polls</h3>",e.target.innerHTML.split(" ")[1]);
    },()=>{
        alert("error");
    });
}