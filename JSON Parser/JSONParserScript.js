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

function search() {
    let txtSearch = document.getElementById("txtSearch");
    let bedFilter = document.getElementById("bedFilter")
    let selSort = document.getElementById("selSort");
    let url = "/apartments/json" + "?search="+txtSearch.value+"&bedrooms="+bedFilter.value+"&sort="+selSort.value;

    loadDoc(url, apt_search_response);
}

function apt_search_response(response) {
     let result = response["result"];

    //When someone is not using the url to filter, and is using the actual search bar, then this is called
    if(!response.result){
         let data = JSON.parse(response);
         result = data["result"];
    }

    let temp = "<table><tr>";
    temp += "<th>Cost</th>";
    temp += "<th>Bedrooms</th>";
    temp += "<th>Title</th>";
    temp += "<th>Description</th>";
    temp += "</tr>";


    for (let i = 0; i < result.length; i++) {

        let row = result[i];

        temp += "<tr>";
        temp += "<td>" + row["rent"] +"</td>";
        temp += "<td>" + row["bedrooms"] +"</td>";
        temp += "<td>" + row["title"] +"</td>";
        temp += "<td>" + row["description"] +"</td>";
        temp += "</tr>";
    }

    temp += "</table>"

    if(result.length == 0){
        temp = "If nothing is being displayed below, then either you didn't click 'Go!' or there is no apartment matching your filters."
    }

    let divResults = document.getElementById("divResults");

    divResults.innerHTML = temp;
}

function urlSearch(data) {
    if (data && data.result) {
        apt_search_response(data);
    }
}

console.log("Script Loaded");
