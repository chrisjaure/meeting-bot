Pebble.addEventListener('ready', function(e) {
	var meetingbot = new Meetingbot();
	meetingbot.getStatus();
	Pebble.addEventListener('appmessage', function(e) {
		switch (e.payload.action) {
			case 'start':
				meetingbot.startMeeting();
				break;
			case 'stop':
				meetingbot.stopMeeting();
				break;
			case 'status':
				meetingbot.getStatus();
				break;
		}
		console.log(e.payload.action);
	});
});

function Meetingbot () {
	var url = 'http://meeting-bot/meeting/';

	function makeRequest (action) {
		var req = new XMLHttpRequest();
		var response;
		req.open('GET', url + action, true);
		req.onload = function(e) {
			if (req.readyState == 4) {
				if (req.status == 200) {
					try {
						response = JSON.parse(req.responseText);
					}
					catch (err) {
						return console.log('Could not parse response!');
					}
					Pebble.sendAppMessage({
						status: (response.inAMeeting ? 'In a meeting' : 'Not in a meeting')
					});
				}
				else {
					console.log('Request failed!');
				}
			}
			else {
				console.log('Request failed!');
			}
		};
		req.onerror = function(event) {
			console.log('Request failed!');
		};
		req.send(null);
	}

	this.startMeeting = function() {
		makeRequest('start');
	};

	this.stopMeeting = function() {
		makeRequest('stop');
	};

	this.getStatus = function() {
		makeRequest('status');
	};
}