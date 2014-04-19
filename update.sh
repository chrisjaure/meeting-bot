#!/usr/bin/env bash
RUNNING=$(status meetingbot | grep 'running');
git pull --rebase;
npm install;
if [[ "$RUNNING" ]]; then
	sudo restart meetingbot;
else
	sudo start meetingbot;
fi
