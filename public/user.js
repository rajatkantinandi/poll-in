function userpage(e){
    let user_id=e.target.getAttribute('data-userid');
    console.log("loading userpage");
    document.querySelector(".main-content #trending-polls").innerHTML="<center><div class='loader loader10'></div></center>";
    ajaxreq("GET","/u/"+user_id,{},(result)=>{
        result=JSON.parse(result);
        let toRender=`<div class='userpage'>
           <h1>${result.username}</h1>
           <div id='pollsbyuser'></div> 
        </div>`;
        document.querySelector(".main-content #trending-polls").innerHTML=toRender;
        showpolls(result.polls.reverse(),document.querySelector(".main-content #pollsbyuser"),"<h3>All polls</h3>",e.target.getAttribute("data-username"));
        if(window.location.href.match(/\/user\//g)){

        }
        else{
        history.pushState({}, "User: "+e.target.getAttribute("data-username"), "user/"+e.target.getAttribute("data-username"));
        }
    },()=>{
        alert("error");
    });
}