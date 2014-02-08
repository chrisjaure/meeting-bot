prefix=/etc/init
upstart_conf=meetingbot.conf

all:
	@echo "usage: make install"
	@echo "       make uninstall"

install:
	install -m 0644 $(upstart_conf) $(prefix)

uninstall:
	rm -f $(prefix)/$(upstart_conf)
