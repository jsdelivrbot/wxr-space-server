

window.onload = function() {
    var socket = io();
	console.log('connect');
	socket.on('categories', function(msg) {
		console.log(msg);
	});
}


// Toggle between showing and hiding the sidebar when clicking the menu icon
// var mySidebar = document.getElementById("mySidebar");

function w3_open() {
    var mySidebar = document.getElementById("mySidebar");
    if (mySidebar.style.display === 'block') {
        mySidebar.style.display = 'none';
    } else {
        mySidebar.style.display = 'block';
    }
}

// Close the sidebar with the close button
function w3_close() {
    var mySidebar = document.getElementById("mySidebar");
    mySidebar.style.display = "none";
}

function call_login_modal() {
    w3_close();

    document.getElementById('loginModalWindow').style.display='block';
}

function close_login_modal() {
    document.getElementById('loginModalWindow').style.display='none';
}