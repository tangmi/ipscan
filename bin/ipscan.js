#!/usr/bin/env node

var ipscan = require('..');

var argv = require('yargs')
	.usage('usage: $0 -p<start[..end]>')
	.options('p', {
		describe: 'specify a port or range of ports',
		demand: 'specify a port or range!'
	})
	.argv;

var ports = /([0-9]+)(?:\.+([0-9]+))?/.exec(argv.p);

ipscan({
	// host: '',
	start: ports[1],
	end: ports[2]
});