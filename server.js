var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var express = require('express');

var app = express();
var isInAMeeting = false;
var blinkInt;
var intros = fs.readdirSync(path.join(__dirname, 'intros'));
var index = fs.readFileSync(path.join(__dirname, 'index.html')).toString('utf-8');
var busy = false;

// gpio 38 = P8.3/GPIO1_6 on Beaglebone
var gpio = process.env.MEETINGBOT_GPIO || 38;
var port = process.env.MEETINGBOT_PORT || 80;

var play = function (file) {

	var ps;
	busy = true;

	if (process.platform === 'darwin') {
		ps = spawn('afplay', [path.join(__dirname, file)]);
	}
	else {
		ps = spawn('play', ['-q', path.join(__dirname, file)]);
	}

	ps.stdout.on('data', function (data) {
		console.log('stdout: ' + data);
	});

	ps.stderr.on('data', function (data) {
		console.log('stderr: ' + data);
	});

	ps.on('close', function (code) {
		busy = false;
		console.log('child process exited with code ' + code);
	});

	ps.on('error', function(err) {
		busy = false;
		console.log(err.message);
	});

};

var blink = function() {
	try {
		fs.writeFileSync('/sys/class/gpio/gpio'+gpio+'/direction', 'high');
		setTimeout(function(){
			fs.writeFileSync('/sys/class/gpio/gpio'+gpio+'/direction', 'low');
		}, 1000);
	} catch(e) {}
};

var playRandomIntro = function() {
	var intro = intros[Math.floor(Math.random()*intros.length)];
	play(path.join('intros', intro));
};

var sendMeetingResponse = function(res) {
	res.send({ inAMeeting: isInAMeeting });
};

var playMeetingStart = play.bind(this, './meeting-start.wav');
var playMeetingEnd = play.bind(this, './meeting-end.wav');

// export the gpio
try {
	fs.writeFileSync('/sys/class/gpio/export', gpio);
} catch (e) {}

// rate limiter
app.use(function(req, res, done) {
	if (busy) {
		sendMeetingResponse(res);
		console.log('Rate limited.');
	}
	else {
		done();
	}
});

app.get('/', function(req, res) {
	res.charset = 'utf-8';
	res.type('html').send(index);
	playRandomIntro();
});

app.get('/meeting/start', function(req, res) {
	if (isInAMeeting) {
		return sendMeetingResponse(res);
	}
	isInAMeeting = true;
	sendMeetingResponse(res);
	playMeetingStart();
	blinkInt = setInterval(blink, 2000);
});

app.get(/\/meeting\/(end|stop)/, function(req, res) {
	if (!isInAMeeting) {
		return sendMeetingResponse(res);
	}
	isInAMeeting = false;
	sendMeetingResponse(res);
	playMeetingEnd();
	clearInterval(blinkInt);
});

app.get('/meeting/status', function(req, res) {
	sendMeetingResponse(res);
});

app.listen(port, function(err){
	if (err) return console.log(err);
	console.log('Listening for meetings!');
});
