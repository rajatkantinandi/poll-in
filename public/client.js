function show(area){
    let obj=document.getElementById(area);
    obj.className="qvisible";
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
    obj.className="hidden"
})
});