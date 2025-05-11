function upload_file(){
    let xhttp = new XMLHttpRequest();
    xhttp.onload = function(){
        if(xhttp.status != 200){
            console.log("Error");
        }else{
            upload_file_response(xhttp.response);
        }
    }

    xhttp.open("POST", "/imgUploader/uploadfile", true);
    var formData = new FormData();

    let imgFile = document.getElementById("file").files[0];
    let caption = document.getElementById("caption").value;
    if(!imgFile || !caption.trim()){
        console.log("No File Uploaded or No Caption")
        upload_file_response(-1);
        return;
    }

    formData.append("file", imgFile);
    formData.append("type",imgFile.type);
    formData.append("caption", caption);

    xhttp.send(formData);
}

function upload_file_response(response){
    if(response == -1){
        let status = document.getElementById("uploadStatus");
        status.innerHTML = "No File Uploaded or No Caption";
        return;
    }
    console.log(response);
    location.reload();
}

function list_files() {
    let xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        if (xhttp.status != 200) {
            console.log("Error");
        }
        else {
            fileparser(xhttp.response);
        }
    }

    xhttp.open("GET", "/imgUploader/listfiles");
    xhttp.send();
}

function fileparser(response){
    let data = JSON.parse(response);
    let url = data["url"];
    let items = data["items"];

    let temp = "<table>";

    for(let i = 0; i < items.length; i++){
        let imgUrl = url+items[i]["id"];
        let caption = items[i]["caption"];

        temp += `<div class="item">`;
        temp += `<img src="${imgUrl}"/}`;
        temp += `<div class="caption">`;
        temp += `${caption}`;
        temp += "</div>";
        temp += "</div>";
    }

    temp += "</table>";

    let imgResults = document.getElementById("imageDivResults");

    imgResults.innerHTML = temp;

}


