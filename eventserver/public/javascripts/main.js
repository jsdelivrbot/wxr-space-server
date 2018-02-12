

window.onload = function() {
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

function call_register_modal() {
    close_login_modal();

    document.getElementById('signupModalWindow').style.display='block';
}

function close_signup_modal() {
    document.getElementById('signupModalWindow').style.display='none';
}

function create_new_workspace() {
	const body = {
		name: ''
	};

	$.ajax({
		url: '/workspace',    //Your api url
		type: 'POST',   //type is any HTTP method
		data: body,
		success: function () {
			console.log('ok');
		}
	})
}