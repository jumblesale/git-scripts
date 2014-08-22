var sprintf = require('sprintf-js').sprintf,
	colors  = require('colors'),
	verbose = false,
	script  = '',
	log     = {
		debug: function(message) {
		    if(true === verbose) {
		        this.info(sprintf('%s %s', 'DEBUG:'.cyan.inverse, message));
		    }
		},

		fatal: function(message) {
		    console.error(sprintf('FATAL: %s', message).red.inverse);
		},

		info: function(message) {
		    console.log(sprintf('%s %s', sprintf('%s:', script).grey.bold.inverse, message, script));
		}
	};

module.exports = function(s, v) {
	script = s.toUpperCase();
	verbose = v;
	return log;
};