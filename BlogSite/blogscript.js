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

//HTML Page stuff
function checkIfLoggedHome(){
     loadDoc("/blog/logCheck", checkIfLoggedParse)
}

function checkIfLoggedParse(isLoggedIn){
    //console.log(isLoggedIn);
    let temp = "";
     if(isLoggedIn == "false"){
         temp += '<button onclick="loginRedirect();">Log In</button>';
     }else{
         temp += '<button onclick="edit_Blog();">Edit Blogs</button>';
     }

    let imgResults = document.getElementById("chosen_button");

    imgResults.innerHTML = temp;
}

function loginRedirect(){
    window.location.replace("/blog/login");
}

function edit_Blog(){
    window.location.replace("/blog/editor");
}

function home_redirect(){
    window.location.replace("/blog");
}

//Blog Stuff
function uploadBlog(){
    let title = document.getElementById("title").value;
    let description = document.getElementById("description").value;

    var formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);

    upload_Data("/blog/editcreate",  uploadUpdate, formData);
}

function deleteBlog(id){
    var formData = new FormData();
    formData.append("id", id);
    //console.log("Delete");
    upload_Data("/blog/editdelete", uploadUpdate, formData);
}

function uploadUpdate(response){
    console.log(response)
    location.reload();
}

function getBlogEntries(isFiltered){
    if(isFiltered){
        loadDoc("/blog/loadBlog", parseBlogs);
    }else{
        loadDoc("/blog/loadBlogEdit", parseEditBlogs);
    }
}


function parseBlogs(response){
    let data = JSON.parse(response);
    let items = data["items"];
    //console.log(items);

    let temp = "<div>";

    for(let i = 0; i < items.length; i++){
        let user = items[i]["user"];
        let title = items[i]["title"];
        let description = items[i]["description"];
        let date = items[i]["date"];

        temp += `<div class="blog-entry">`;
        temp += `<h3 class="blog-user">${user}</h3>`;
        temp += `<h3 class="blog-title">${title}</h3>`;
        temp += `<span class="blog-date">${date}</span>`;
        temp += `<p class="blog-description">${description}</p>`;
        temp += `</div>`;
    }

    temp += "</div>";

    //console.log(temp);

    let blogResults = document.getElementById("blogDivResults");

    blogResults.innerHTML = temp;
}

function parseEditBlogs(response){
    let data = JSON.parse(response);
    let items = data["items"];

    let temp = "<div>";

    for(let i = 0; i < items.length; i++){
        let title = items[i]["title"];
        let description = items[i]["description"];
        let date = items[i]["date"];
        let blogid = items[i]["blogId"];

        temp += `<div class="blog-entry">`;
        temp += `<h3 class="blog-title">${title}</h3>`;
        temp += `<span class="blog-date">${date}</span>`;
        temp += `<p class="blog-description">${description}</p>`;
        temp += `<button onclick="deleteBlog('${blogid}');" class="btn delete-btn">Delete</button>`;
        temp += `</div>`;
    }

    temp += "</div>";

    let blogResults = document.getElementById("blogEditDivResults");

    blogResults.innerHTML = temp;
}

//Account Stuff
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
       url = "/blog/create";
    }else{
       email =  document.getElementById("logEmail").value;
       pass =  document.getElementById("logPass").value;
       url = "/blog/logIn";
    }

    //Make sure nothing is blank
    if(!email.trim() || !pass.trim()){
        logInParse(`{"result":-1}`);
        return;
    }

    formData.append("email", email);
    formData.append("password", pass);

    upload_Data(url, logInParse, formData);
}

function getSessionName(){
    loadDoc("/blog/session", returnSessionName);
}

function returnSessionName(response){
    let temp = response;

    let imgResults = document.getElementById("userName");

    imgResults.innerHTML = temp;
}

function logInParse(response){
 var data = JSON.parse(response);
 let value = data["result"];

  let status = document.getElementById("results");
//console.log(value);
 if(value == 1){
     edit_Blog();
 }else if(value == 0){
     status.innerHTML = "There is already an account with this Email/Username";
 }else{
     status.innerHTML = "Invalid Email/Username/Password";
 }
}

function logOut(){
    window.location.replace("/blog/logOut");
}

