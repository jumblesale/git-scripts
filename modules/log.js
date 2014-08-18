var sprintf = require('sprintf-js').sprintf,
	verbose = false,
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
		    console.log(sprintf('%s %s', 'DEPLOY:'.grey.bold.inverse, message));
		}
	};

// module.exports = log;
module.exports = function(v) {
	verbose = v;
	return log;
};