const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'dev@wrl.onl',
		pass: 'kistimrc8223'
	}
});


// mailer.sendInvitationMail(memberInstance.p('email'), `http://es.webizing.org/workspaces/` + workspaceInstance.id + `/members/join`)


module.exports = {
	sendInvitationMail: function(address, name, link) {

		const mailOptions = {
			from: 'dev@wrl.onl',
			to: address,
			subject: 'Invitation for you to WXR workspace',
			text: '',
			html: `
Hello, ${name} <br>
<br>
You've got a invitation for the WXR workspace!!! <br>
Please click the following link: <br>
		<a href="${link}">Getting involved</a> <br>
<br>
Thanks!
			`
		};

		transporter.sendMail(mailOptions, function(error, info){
			if (error) {
				console.log(error);
			} else {
				console.log('Email sent: ' + info.response);
			}
		});
	}
};