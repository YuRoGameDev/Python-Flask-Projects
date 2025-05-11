function loadDoc(url, func) {
    let xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        if (xhttp.status != 200) {
            console.log("Error");
        }
        else {
            func(xhttp.response);
        }
    }

    xhttp.open("GET", url);
    xhttp.send();
}

function upload_Data(url, func, form){
    let xhttp = new XMLHttpRequest();
    xhttp.onload = function(){
        if(xhttp.status != 200){
            console.log("Error");
        }else{
            func(xhttp.response);
        }
    }

    xhttp.open("POST", url, true);
    xhttp.send(form);
}

//----- User Page
function loadUser(username){
    url = "/twitter/u/username?user="+username;
    window.location.replace(url);
}

function log_Out(){
    window.location.replace("/twitter/logOut");
}

function getEmail(username, div){
    var formData = new FormData();
    formData.append("username", username);
     return upload_Data("/twitter/sessionEmail",
        function(email){
            console.log(email);
            getProfile(email, div);
        } ,formData);
}

function getProfile(email, emailDiv){
    var formData = new FormData();
    formData.append("email", email);
    upload_Data("/twitter/profile",
        function(response){
            setProfilePic(response, emailDiv);
        }, formData);
}

function setProfilePic(response, emailDiv = ""){
    console.log(emailDiv);
    var data = JSON.parse(response);
    let value = data["url"];
    console.log(value)
    temp = `<img src="${value}" class="${emailDiv}"/>`;


    let imgResults = document.querySelectorAll(`#${emailDiv}`);

    imgResults.forEach((img) => {img.innerHTML = temp;})

    //let imgResults = document.getElementById(emailDiv);
    //imgResults.innerHTML = temp;
}

function checkIfMyPage(username){
    myUsername = loadDoc("/twitter/session", function(myUsername){
        if(username == myUsername){
            console.log("IsMine");
            temp = `<input type="file" id="file" accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"/>`
            temp += `<button onclick="upload_file();">Upload</button>`
            temp += `<button onclick="log_Out();">Log Out</button>`
            let imgResults = document.getElementById("ChangeProfilePic");
            imgResults.innerHTML = temp;

            imgResults = document.getElementById("UploadTweet");
            temp = `<section class="section">
                    <h1>Create a Post</h1>
                    <textarea type="text" id="description" placeholder="Enter Text" class="input-field description-input" maxlength="1000"></textarea>
                    <button onclick="uploadTweet()" class="btn post-btn">Post</button>
                    </section>`
            imgResults.innerHTML = temp;

        }
    });
}

function upload_file(){
    var formData = new FormData();
    let imgFile = document.getElementById("file").files[0];
    if(!imgFile){
        console.log("No File Uploaded");
        upload_file_response(-1);
        return;
    }

    formData.append("file", imgFile);
    formData.append("type", imgFile.type);

    upload_Data("/twitter/profileChange", upload_file_response, formData);
}

function upload_file_response(response){
    if(response == -1){
        let status = document.getElementById("uploadStatus");
        status.innerHTML = "No File Uploaded";
        return;
    }else if(response == -2){
        let status = document.getElementById("uploadStatus");
        status.innerHTML = "Error Uploading";
        return;
    }
    console.log(response);
    location.reload();
}

function uploadTweet(isReply){
    var formData = new FormData();

    if(!isReply){
        let desc = document.getElementById("description").value;
        formData.append("description", desc);

        upload_Data("/twitter/uploadTweet",uploadUpdate,formData);
    }
    else{
        let desc = document.getElementById("replyDescription").value;
        formData.append("description", desc);

        let parentID = document.getElementById("mainTweet").innerText;
        formData.append("parentId", parentID);

        upload_Data("/twitter/uploadReply",uploadUpdate,formData);
    }

}

function deleteTweet(id, isReply){
    var formData = new FormData();
    formData.append("id", id);
    //console.log("Delete");

    if(isReply){
        upload_Data("/twitter/deleteReply",uploadUpdate,formData);
    }else{
        upload_Data("/twitter/deleteTweet", uploadUpdate, formData);
    }
}


function uploadUpdate(response){
    console.log(response)
    location.reload();
}
//------


//----Feed Page
function loginRedirect(){
    window.location.replace("/twitter/login");
}

function checkIfLoggedIn(){
     loadDoc("/twitter/logCheck", checkIfLoggedParse)
}

function checkIfLoggedParse(isLoggedIn){
    //console.log(isLoggedIn);
    let isLogged = false;
    let temp = "";
     if(isLoggedIn == "false"){
         temp += '<h3> Login or Create an Account to Post</h3>'
         temp += '<button onclick="loginRedirect();">Log In</button>';
     }else{
         temp += `<div class="ProfilePic">`
         temp += `<div id="myProfilePic"></div>`
         temp += "</div>"
         temp += `<h1>Hi ${username}</h1>`
         temp += `<button onclick="loadUser('${username}');">Profile</button>`;
         isLogged = true;

         let reply = `<h1>Reply</h1>
            <textarea type="text" id="replyDescription" placeholder="Enter Text" class="input-field description-input" maxlength="1000"></textarea>
            <button onclick="uploadTweet(true)" class="btn post-btn">Post</button>`;
         let replyResults = document.getElementById("logInReply");
         replyResults.innerHTML = reply;
     }

    let imgResults = document.getElementById("MyProfile");

    imgResults.innerHTML = temp;

    if(isLogged){
        getProfile("","myProfilePic");
    }
}
//----

//---Login Page
function home_redirect(){
    window.location.replace("/twitter");
}

function logIn(isMakingAccount){
    var formData = new FormData();
    let url = "";
    let email = "";
    let pass = "";
    if(isMakingAccount){
       let user = document.getElementById("createUser").value;
       if(!user.trim()){
           logInParse(`{"result":-1}`);
           return;
       }

       formData.append("username", user);
       email = document.getElementById("createEmail").value;
       pass =  document.getElementById("createPass").value;
       url = "/twitter/create";
    }else{
       email =  document.getElementById("logEmail").value;
       pass =  document.getElementById("logPass").value;
       url = "/twitter/logIn";
    }

    //Make sure nothing is blank
    if(!email.trim() || !pass.trim()){
        logInParse(`{"result":-1}`);
        return;
    }

    //Check if valid email
    let atIndex = email.indexOf("@");
    let dotIndex = email.indexOf(".", atIndex);
    if (atIndex == -1 || dotIndex == -1 || dotIndex <= atIndex + 1){
        logInParse(`{"result":-1}`);
        return;
    }

    formData.append("email", email);
    formData.append("password", pass);

    upload_Data(url, logInParse, formData);
}

function logInParse(response){
 var data = JSON.parse(response);
 let value = data["result"];

  let status = document.getElementById("results");
//console.log(value);
 if(value == 1){
     console.log("Loggedin")
     loadUser(data["username"]);
 }else if(value == 0){
     status.innerHTML = "There is already an account with this Email/Username";
 }else{
     status.innerHTML = "Invalid Email/Username/Password";
 }


}
//---

//---Tweets
function loadTweets(filter, currentUser){
    var formData = new FormData();
    formData.append("filter", filter);
    upload_Data("/twitter/getTweets",
    function(response){
            feedParse(response, currentUser);
        }, formData);
}

function feedParse(response, currentUser){
    var data = JSON.parse(response);
    let items = data["items"];
    console.log(items);
    let shownUsers = [];

    let temp = "<div>";

    for(let i = 0; i < items.length; i++){
        if(i >= 9){
            console.log("Max 10");
            break;
        }
        let tweetid = items[i]["tweetId"];
        let user = items[i]["username"];
        let description = items[i]["description"];
        let date = items[i]["date"];


        temp += `<div class="tweet-feed">`;

        temp += `<div class="tweet-header">`;
        temp += `<div id="img-tweet-${user}" class="tweet-img"></div>`;

        temp += `<a class="tweet-user" onclick="loadUser('${user}')">${user}</a>`;
        temp += `</div>`;

        temp += `<div class="tweet-footer">`;
        temp += `<p class="tweet-description">${description}</p>`;

        temp += `<span class="tweet-date">${date}</span>`;
        temp += `<button onclick="reply('${tweetid}', '${currentUser}');" class="btn reply-btn">Reply</button>`;

        if(user == currentUser){
            console.log("IsMyTweet");
            temp += `<button onclick="deleteTweet('${tweetid}', ${false});" class="btn delete-btn">Delete</button>`;

        }

        temp += `</div>`;



        if(!shownUsers.includes(user)){
            shownUsers.push(user);
            divId = "img-tweet-"+user;
            getEmail(user, divId);
        }

        temp += `</div>`;

    }

    temp += "</div>";

    let tweetResults = document.getElementById("Tweets");

    tweetResults.innerHTML = temp;
}

//----View Tweets
function closeTweet(){
    const menu = document.getElementById("tweetView");
    menu.classList.toggle("hidden");
}

function reply(id, currentUser){
    const menu = document.getElementById("tweetView");
    menu.classList.toggle("hidden");

    idValue = id.split("/")[0];

    var formData = new FormData();
    formData.append("filter", idValue);
    formData.append("reply", "true");

    upload_Data("/twitter/getTweets",
    function(response){
            viewTweetParse(response, currentUser);
        }, formData);

}


function viewTweetParse(response, currentUser){
    var data = JSON.parse(response);
    let items = data["items"];
    console.log(items);
    let shownUsers = [];

    let temp = "<div>";
    temp += `<div class="tweet-overlay">`
    for(let i = 0; i < items.length; i++){
        let tweetid = items[i]["tweetId"];
        let user = items[i]["username"];
        let description = items[i]["description"];
        let date = items[i]["date"];
        let type = items[i]["type"]

        let isReply = true;
        if(i == 0 && type == 0){
            console.log("Top Tweet");
            isReply = false;
            temp += `<div id="mainTweet" hidden>${tweetid}</div>`;
        }

         temp += `<div class="tweet-feed">`;
         temp += `<div class="tweet-header">`;
        temp += `<div id="img-tweet-feed-${user}" class="tweet-img"></div>`;

        temp += `<a class="tweet-user" onclick="loadUser('${user}')">${user}</a>`;
        temp += `</div>`;


        temp += `<div class="tweet-footer">`;
        temp += `<p class="tweet-description">${description}</p>`;
        temp += `<span class="tweet-date">${date}</span>`;



        if(user == currentUser){
            console.log("IsMyTweet");
            temp += `<button onclick="deleteTweet('${tweetid}', ${isReply});" class="btn delete-btn">Delete</button>`;
        }
        temp += `</div>`;

        if(!shownUsers.includes(user)){
            shownUsers.push(user);
            divId = "img-tweet-feed-"+user;
            getEmail(user, divId);
        }

        temp += `</div>`;

    }
    temp += "</div>";
    temp += "</div>";

    let tweetResults = document.getElementById("viewedTweet");

    tweetResults.innerHTML = temp;
}












