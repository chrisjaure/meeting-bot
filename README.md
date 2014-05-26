MeetingBot
==========

MeetingBot alerts my family when I'm in a meeting. It's operating on a Beaglebone running Ubuntu.

[View demo video.](http://youtu.be/37cybHSpT8A)


Dependencies
------------

- [SoX](http://sox.sourceforge.net/) or `afplay` (for testing on Mac OSX)
- [nodejs](http://nodejs.org/)


Usage
-----

`[sudo] node server.js`

You can set a couple env vars to change some options:

- `MEETINGBOT_GPIO` - defaults to `38` if not set
- `MEETINGBOT_PORT` - defaults to `80` if not set

If you're running Ubuntu or have upstart you can run `sudo make install` to install the upstart config file which will set meetingbot up as a service.


Web API
-------

- `/metting/start` - starts the meeting
- `/meeting/stop` - stops the meeting
- `/meeting/status` - gets the status of the meeting

All requests respond with the following JSON:

```
{
  inAMeeting: true|false
}
```


Installing Pebble Remote
------------------------

1. Install the [pebble sdk](https://developer.getpebble.com/2/getting-started/)
2. `cd pebble-app`
3. Update `src/js/pebble-js-app.js:21` to the correct ip address
4. `pebble build`
5. `pebble install --phone <phone ip address>`


Generating Audio
----------------

I used Mac OSX to generate the wav files using the following command: `say -o <filename>.wav --data-format=LEF32@8000 "<text>"`.

Here's a nice list of different voices: [Terminal 101: Making your Mac talk with “say”](http://www.maclife.com/article/columns/terminal_101_making_your_mac_talk_%E2%80%9Csay%E2%80%9D)
