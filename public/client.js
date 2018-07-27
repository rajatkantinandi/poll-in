let auth_user = null;
if (document.getElementById("usericon")) {
  auth_user = document.getElementById("usericon").getAttribute("data-userid");
  console.log(auth_user);
} else {
  auth_user = null;
}
function showtrending(container, username) {
  ajaxreq(
    "get",
    "/trending-polls",
    {},
    result => {
      document.querySelector(".loader-bg").style.display = "none";
      let child = "<h3>Popular Polls</h3>";
      result = JSON.parse(result);
      showpolls(result, container, child, username);
    },
    err => {
      container.innerHTML = "<h3>Error getting data!!</h3>";
    }
  );
}
function showpolls(result, container, child, username) {
  result.forEach(item => {
    let question = item.question;
    let options = item.options;
    let createdBy = item.createdBy;
    let id = item["_id"];
    child +=
      "<div class='poll' id='" +
      id +
      "'><i style='color:#666'>👤 " +
      createdBy +
      "</i> &nbsp; <i style='color:#558'>@" +
      item.at +
      "</i><hr/><b>" +
      question +
      "</b>";
    child +=
      "<form action='/vote' method='post'  onsubmit='return voteme(event)'><div class='options'>";
    child += "<input type='hidden' name='id' value='" + id + "'/>";
    for (option of options) {
      child +=
        "<div class='option'><input type='radio' name='poll' value='" +
        option.value +
        "'/><span class='option-val'>" +
        option.value +
        "</span></div>";
    }
    child +=
      "</div><div style='display:flex;flex-wrap:wrap;'><button class='btn btn-green' type='submit'>Vote</button> ";
    if (createdBy === username) {
      child +=
        "<a href='javascript:console.log();' onclick='deletePoll(event)' class='btn btn-red' data-id='" +
        id +
        "'>Delete</a> ";
    }
    child +=
      "<a class='btn btn-green' href='javascript:console.log();' id='add-option-btn' onclick='addOptnDialog(event)' data-url='/update-poll' data-id='" +
      id +
      "'>Add Option</a>";
    child +=
      "<a class='btn btn-blue' href='javascript:console.log();' data-results='" +
      JSON.stringify(options) +
      "' data-title='" +
      question +
      "' type='reset' onclick='showresult(event)'>Show Result</a><a class='btn btn-black' href='javascript:console.log();' onclick='sharing(event)' data-url='poll/" +
      id +
      "' data-question='" +
      question +
      "'>🔗 share</a>";
    child += "</div></form></div>";
  });
  container.innerHTML = child;
}
function deletePoll(e) {
  let poll_id = e.target.getAttribute("data-id");
  let r = confirm("Are you sure you want to delete!");
  if (r == true) {
    e.target.innerHTML = "Deleting...";
    ajaxreq(
      "get",
      "/deletepoll?id=" + poll_id + "&userid=" + auth_user,
      {},
      result => {
        let delem = document.getElementById(poll_id);
        delem.parentElement.removeChild(delem);
        console.log("deleted:" + poll_id);
      },
      err => {
        console.log("Unauthorised Access");
      }
    );
  }
}
function signout() {
  window.location.replace("/signout");
}
function showcreate(e) {
  document.querySelector(".create-polls").style.display = "block";
  document.querySelector(".create-polls #question-to-submit").focus();
}
function createPoll() {
  if (document.querySelector("#question-to-submit").value.endsWith("?")) {
    return true;
  } else {
    alert("Invalid question type.\nPlease put a question-mark at the end.");
    return false;
  }
  return false;
}
function show(area) {
  let obj = document.getElementById(area);
  obj.className = "qvisible";
  document.querySelector(".bg-layer").style.visibility = "visible";
  document.querySelectorAll(".qvisible").forEach(elem => {
    if (elem != obj) {
      elem.className = "hidden";
    }
  });
}
function focusto(elem) {
  let obj = document.getElementById(elem);
  obj.focus();
}
document.querySelectorAll(".close-btn").forEach(elem => {
  elem.addEventListener("click", e => {
    let obj = e.target.parentNode;
    obj.className = "hidden";
    document.querySelector(".bg-layer").style.visibility = "hidden";
  });
});
function hideall() {
  document.querySelectorAll(".qvisible").forEach(elem => {
    elem.className = "hidden";
  });
  document.querySelector(".bg-layer").style.visibility = "hidden";
}
document.querySelector(".bg-layer").addEventListener("click", e => {
  hideall();
});
function ajaxreq(method, url, data, callback1, callback2) {
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      callback1(this.responseText);
    } else if (this.readyState == 4 && this.status != 200) {
      callback2(this.responseText);
    }
  };
  xhttp.open(method, url, true);
  if (method.toUpperCase() == "POST") {
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    let dataToSend = "";
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        dataToSend += key + "=" + data[key] + "&";
      }
    }
    dataToSend = dataToSend.substr(0, dataToSend.length - 1);
    xhttp.send(dataToSend);
  } else if (method.toUpperCase() == "GET") {
    xhttp.send();
  }
}
let useravail = false;
let passmatch = false;
document.querySelectorAll("#sign-up-form input").forEach(elem => {
  elem.addEventListener("keyup", e => {
    document.querySelector("#sign-up-form button").disabled = true;
    let target = e.target;
    if (target == document.querySelector("#username-signup")) {
      useravail = false;
      useravail1(target.value);
    } else if (
      target == document.querySelector("input#password-signup-repeat")
    ) {
      passmatch = false;
      passmatch1(target.value);
    }

    //functions
    function useravail1(username) {
      let status = document.querySelector("#username-status");
      status.innerHTML = "";
      if (username != "") {
        status.innerHTML = "Checking...";
        ajaxreq(
          "GET",
          "/checkavailuser/" + username,
          {},
          result => {
            status.innerHTML = "✅ Username available";
            status.style.background = "#9c9";
            useravail = true;
            enablesignupbtn();
          },
          err => {
            status.innerHTML = "❌ Username unavailable, choose another";
            status.style.background = "#c99";
            enablesignupbtn();
          }
        );
      }
    }
    function passmatch1(password) {
      if (password == document.querySelector("#password-signup").value) {
        document.querySelector("#password-status").innerHTML =
          "✅ Passwords matched";
        passmatch = true;
      } else {
        document.querySelector("#password-status").innerHTML =
          "❌ Passwords doesn't match";
      }
      enablesignupbtn();
    }
    function enablesignupbtn() {
      if (useravail == true && passmatch == true) {
        document.querySelector("#sign-up-form button").disabled = false;
      }
    }
  });
});
document.querySelector("#hamburger-menu-btn").addEventListener("click", e => {
  if (document.querySelector(".hamburger-menu").style.display == "block") {
    document.querySelector(".main-content").style.margin = "100px 0px 0px 0px";
    document.querySelector(".hamburger-menu").style.display = "none";
  } else {
    document.querySelector(".hamburger-menu").style.display = "block";
    document.querySelector(".main-content").style.margin =
      "100px 0px 0px 200px";
  }
});
function voteme(e) {
  pollid = e.target.querySelector("input[name=id]").value;
  let poll = e.target.querySelector(".option input:checked").value;
  console.log("poll-id: " + pollid + ", Poll: " + poll);
  e.target.querySelector(".btn-green").innerHTML = "Voting...";
  ajaxreq(
    "POST",
    "/vote",
    { id: pollid, poll: poll },
    result => {
      let results = JSON.parse(
        e.target.querySelector(".btn-blue").getAttribute("data-results")
      );
      results.forEach(elem => {
        if (elem.value == poll) {
          elem.votes = elem.votes + 1;
        }
      });
      e.target
        .querySelector(".btn-blue")
        .setAttribute("data-results", JSON.stringify(results));
      e.target.querySelector(".btn-green").innerHTML = "✅ Voted";
      e.target.querySelector(".btn-green").disabled = true;
      alert(result);
    },
    err => {
      console.log("Error: " + err);
    }
  );
  return false;
}
function showresult(e) {
  google.charts.load("current", { packages: ["corechart"] });
  google.charts.setOnLoadCallback(drawChart);
  function drawChart() {
    let values = [["Option", "Votes"]];
    let result_votes = JSON.parse(e.target.getAttribute("data-results"));
    for (vote of result_votes) {
      values.push([vote.value, vote.votes]);
    }
    let data = google.visualization.arrayToDataTable(values);
    let options = {
      title: e.target.getAttribute("data-title"),
      is3D: true
    };

    let chart = new google.visualization.PieChart(
      document.getElementById("piechart")
    );

    chart.draw(data, options);
  }
  show("chart");
}
function sharing(e) {
  let location =
    window.location.href.split("/")[0] +
    "//" +
    window.location.href.split("/")[2] +
    "/";
  document.querySelector("#shareui #shareurl").value =
    location + e.target.getAttribute("data-url");
  document.querySelector("#shareui #share-on-twitter").href =
    "https://twitter.com/intent/tweet?hashtags=poll_in&related=poll-in&text=Poll-in Poll >>%0A" +
    e.target.getAttribute("data-question") +
    " %0ACast your vote here.. %0A" +
    location +
    e.target.getAttribute("data-url");
  document.querySelector("#shareui #copy-btn-share").innerHTML = "📋 Copy";
  document.querySelector("#share-on-fb").href =
    "https://fb.com/sharer.php?u=" +
    location +
    e.target.getAttribute("data-url");
  show("shareui");
}
function copyurl(e) {
  let cpyarea = document.querySelector("#shareurl");
  cpyarea.select();

  try {
    if (document.execCommand("copy")) {
      document.querySelector("#copy-btn-share").innerHTML = "✅ Copied!!";
    }
  } catch (err) {
    console.log("Oops, unable to copy");
  }
}
function addOptn(e) {
  let optionsToSubmit = document.querySelector(".create-polls .optionsToSubmit")
    .innerHTML;
  let numOfOptions = optionsToSubmit.match(/<input/g).length;
  let elem = document.createElement("input");
  elem.type = "text";
  elem.className = "input-txt";
  elem.name = "option" + (numOfOptions + 1);
  elem.placeholder = "Enter the option" + (numOfOptions + 1);
  document.querySelector(".create-polls .optionsToSubmit").appendChild(elem);
  document.getElementById("numOfOptions").value = numOfOptions + 1;
}

function addOptnDialog(e) {
  document
    .querySelector("#addoptnui .btn-green")
    .setAttribute("data-url", e.target.getAttribute("data-url"));
  document
    .querySelector("#addoptnui .btn-green")
    .setAttribute("data-id", e.target.getAttribute("data-id"));
  document.querySelector("#addoptnui #add-optn-input").innerHTML = "";
  document.querySelector("#addoptnui .btn-green").innerHTML = "Add option";
  document.querySelector("#addoptnui #add-optn-input").value = "";
  show("addoptnui");
  document.querySelector("#addoptnui #add-optn-input").focus();
}
function addOptnToDB(e) {
  document.querySelector("#addoptnui .btn-green").innerHTML = "Adding...";
  ajaxreq(
    "GET",
    e.target.getAttribute("data-url") +
      "?id=" +
      e.target.getAttribute("data-id") +
      "&option=" +
      document.querySelector("#addoptnui #add-optn-input").value,
    {},
    result => {
      document.querySelector("#addoptnui .btn-green").innerHTML =
        "✅ Option Added";
      let optionselem = document
        .getElementById(e.target.getAttribute("data-id"))
        .querySelector(".options");
      let optionsHtml = optionselem.innerHTML;
      optionsHtml += `<div class='option'>
        <input type='radio' name='poll' value='${
          document.querySelector("#addoptnui #add-optn-input").value
        }'/><span class='option-val'>${
        document.querySelector("#addoptnui #add-optn-input").value
      }</span>
      </div>`;
      optionselem.innerHTML = optionsHtml;
      let updatedResult = JSON.parse(
        document
          .getElementById(e.target.getAttribute("data-id"))
          .querySelector(".btn-blue")
          .getAttribute("data-results")
      );
      updatedResult.push({
        value: document.querySelector("#addoptnui #add-optn-input").value,
        votes: 1
      });
      document
        .getElementById(e.target.getAttribute("data-id"))
        .querySelector(".btn-blue")
        .setAttribute("data-results", JSON.stringify(updatedResult));
      setTimeout(hideall, 1000);
    },
    err => {
      alert("Error in adding data.. " + err);
    }
  );
}
function signInAction() {
  console.log("checking...");
  var username = document.querySelector("#username-login").value;
  var password = document.querySelector("#password-login").value;
  document.getElementById("login-form-btn").innerHTML = "Please wait...";
  if (username && password) {
    ajaxreq(
      "POST",
      "/signin",
      { username, password },
      response => {
        document.getElementById("login-form-btn").innerHTML = "Redirecting..";
        window.location.reload();
      },
      err => {
        document.getElementById("login-form-btn").innerHTML = "Login";
        alert("Error: " + err);
      }
    );
  } else {
    alert("Username or Password must not be empty");
  }
  return false;
}
