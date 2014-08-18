var sprintf = require('sprintf-js').sprintf;

exports.debug = function(message) {
    if(true === opts.verbose) {
        this.info(sprintf('%s %s', 'DEBUG:'.cyan.inverse, message));
    }
};

exports.fatal = function(message) {
    console.error(sprintf('FATAL: %s', message).red.inverse);
};

exports.info = function(message) {
    console.log(sprintf('%s %s', 'DEPLOY:'.grey.bold.inverse, message));
};
