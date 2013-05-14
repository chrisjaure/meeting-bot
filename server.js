var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var express = require('express');
var nunjucks = require('nunjucks');

var app = express();
var env = new nunjucks.Environment(new nunjucks.FileSystemLoader(__dirname));
var index = env.getTemplate('index.html');
var isInAMeeting = false;
var blinkInt;
var gpio = process.env.GPIO || '38';

var play = function (file) {

	var ps = spawn('play', ['-q', path.join(__dirname, file)]);

	ps.stdout.on('data', function (data) {
		console.log('stdout: ' + data);
	});

	ps.stderr.on('data', function (data) {
		console.log('stderr: ' + data);
	});

	ps.on('close', function (code) {
		console.log('child process exited with code ' + code);
	});

}

var blink = function() {
	try {
		fs.writeFileSync('/sys/class/gpio/gpio'+gpio+'/direction', 'high');
		setTimeout(function(){
			fs.writeFileSync('/sys/class/gpio/gpio'+gpio+'/direction', 'low');
		}, 1000);
	} catch(e) {}
}

var playMeetingStart = play.bind(this, './meeting-start.wav');
var playMeetingEnd = play.bind(this, './meeting-end.wav');
var playIntro = play.bind(this, './meeting-bot.wav');

// export the gpio
try {
	fs.writeFileSync('/sys/class/gpio/export', gpio);
} catch (e) {}

app.get('/', function(req, res) {
	res.charset = 'utf-8';
	res.type('html').send(index.render({ inAMeeting: isInAMeeting }));
	playIntro();
});

app.get('/meeting/start', function(req, res) {
	isInAMeeting = true;
	res.send('Dad is in a meeting now.');
	playMeetingStart();
	blinkInt = setInterval(blink, 2000);
});

app.get(/\/meeting\/(end|stop)/, function(req, res) {
	isInAMeeting = false;
	res.send('Dad is done with his meeting.');
	playMeetingEnd();
	clearInterval(blinkInt);
});

app.listen(80, function(err){
	if (err) return console.log(err);
	console.log('Listening for meetings!');
});
