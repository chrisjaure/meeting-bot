Pebble.addEventListener('ready', function(e) {
	var meetingbot = new Meetingbot();
	Pebble.addEventListener('appmessage', function(e) {
		switch (e.payload.action) {
			case 'start':
				meetingbot.startMeeting();
				break;
			case 'stop':
				meetingbot.stopMeeting();
				break;
		}
		for (var prop in e.payload) {
			console.log(prop);
		}
	});
});

function Meetingbot () {
	var url = 'http://meeting-bot/meeting/';

	function makeRequest (action) {
		var req = new XMLHttpRequest();
		req.open('GET', url + action, true);
		req.onload = function(e) {
			if (req.readyState == 4 && req.status == 200) {
				if (req.status == 200) {

				}
				else { console.log("Error"); }
			}
		};
		req.send(null);
	}

	this.startMeeting = function() {
		makeRequest('start');
	};

	this.stopMeeting = function() {
		makeRequest('stop');
	};
}