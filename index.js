require('colour');

var async = require('async');

var arp = require('arp-a'),
	portscanner = require('portscanner'),
	mac = require('mac-lookup'),
	services = require('service-names');

module.exports = function(opt) {
	var ipaddr = opt.addr || null,
		portstart = opt.start || 80,
		portend = opt.end || portstart;

	getIpList(function(list) {

		process.stdout.write('scanning port');
		if (portstart == portend) {
			process.stdout.write(' ' + portstart + ' ');
		} else {
			process.stdout.write('s ' + portstart + ' to ' + portend + ' ');
		}
		process.stdout.write('on:\n  ' + ipListToString(list) + '\n');
		console.log();

		console.log('working...')
		var tasks = [];
		for (var i = 0; i < list.length; i++) {
			// load up the tasks
			tasks.push((function(i) {
				var ip = list[i].ip;
				return function(cb) {
					// find all open (responding) ports and attach a service name to each
					// (should the service name part eventually be broken out into a view?)
					portscanner.findAPortInUse(portstart, portend, ip, function(error, port) {
						if (port) {
							console.log('%s:%s port in use!'.green + ' (%s -> %s)'.gray, ip, port,  services.tcp[port].name, services.tcp[port].description)
							list[i].open.push({
								port: port,
								service: services.tcp[port] || {
									// default empty values
									name: null,
									description: null
								}
							});
						} else {
							console.log('%s no open ports found'.gray, ip)
						}
						cb();
					});
				};
			})(i));
		}

		// execute the tasks and print results
		async.parallel(tasks, function() {
			console.log('...done');
			console.log();
			console.log('results:');
			list.forEach(function(el) {
				if (el.open.length == 0) {
					console.log('%s - %s (%s)'.gray, el.ip, el.mac, el.vendor);
				} else {
					console.log('%s - %s (%s)', el.ip, el.mac, el.vendor);

					el.open.forEach(function(open) {
						console.log('  - %s (%s -> %s)', open.port, open.service.name, open.service.description);
					});
				}
			});
		});
	});
};

// get a list of ip/mac address and associate each with a vendor
function getIpList(cb) {
	var list = [];
	var fns = [];

	arp.table(function(err, entry) {
		if (!!err) return console.log('arp: ' + err.message);
		if (!entry) {
			// end of entries
			return async.parallel(fns, function() {
				cb(list);
			});
		};

		fns.push((function(entry) {
			return function(cb) {
				var oui = entry.mac.substr(0, 8);
				mac.lookup(oui, function(err, name) {
					if (err) throw err;

					list.push({
						mac: entry.mac,
						vendor: name,
						ip: entry.ip,
						open: []
					});
					cb();
				});
			}
		})(entry));
	});
}

var util = require('util');
function ipListToString(list) {
	var ips = [];
	list.forEach(function(el) {
		ips.push(util.format('%s - %s (%s)', el.ip, el.mac, el.vendor));
	});
	return ips.join('\n  ');
}