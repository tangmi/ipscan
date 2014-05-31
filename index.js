require('colour');

var arp = require('arp-a'),
	portscanner = require('portscanner');

module.exports = function(opt) {
	var ipaddr = opt.addr || null,
		portstart = opt.start || 80,
		portend = opt.end || portstart;

	getIpList(function(list) {

		console.log('scanning ports %s to %s on:\n  %s', portstart, portend, list.join('\n  '));
		console.log();

		console.log('results:')
		for (var i = 0; i < list.length; i++) {
			var ip = list[i];

			(function(ip) {
				portscanner.findAPortInUse(portstart, portend, ip, function(error, port) {
					if (port) {
						console.log('%s:%s port in use!'.green, ip, port)
					} else {
						console.log('%s no open ports found'.gray, ip)
					}
				});
			})(ip);
		}
	});
};

function getIpList(cb) {
	var ips = [];
	arp.table(function(err, entry) {
		if (!!err) return console.log('arp: ' + err.message);
		if (!entry) {
			// end of entries
			cb(ips);
			return;
		};

		ips.push(entry.ip);
	});
}