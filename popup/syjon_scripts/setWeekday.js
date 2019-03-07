window.setWeekday = (day) => {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById("main").innerHTML = this.responseText;
            window.postMessage({ action: "INIT_SYJON" }, "*");
        }
    };
    xhttp.open("GET", "/weekday/"+day, true);
    xhttp.send();
};