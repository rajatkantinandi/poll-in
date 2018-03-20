function userpage(e){
    let user_id=e.target.getAttribute('data-userid');
    console.log("loading userpage");
    document.querySelector(".main-content").innerHTML="<div class='loader loader10'></div>";
    ajaxreq("GET","/user/"+user_id,(result)=>{
        result=JSON.parse(result);
        let toRender=`<div class='userpage'>
           <h1>${result.username}</h1>
           <div class='polls'></div> 
        </div>`;
        document.querySelector(".main-content").innerHTML=toRender;
        showpolls(result.polls,document.querySelector(".main-content .pollsbyuser"),"<h3>All polls</h3>");
    },()=>{
        alert("error");
    })
}