var colors  = require('colors'),
    sprintf = require('sprintf-js').sprintf,
    _       = require('underscore'),

    dino = ['            __',
            '           / o)',
            '    .-^^^-/ /',
            ' __/       /',
            '<__.|_|-|_|'],

    say = function(message) {
        console.log();
        dino[1] += sprintf(' %s'.white.bold, message);
        console.log(dino[0].green);
        console.log(dino[1].green);
        dino.splice(0, 2);
        _.each(dino, function(line) {
            console.log(line.green);
        });
        console.log();
    };

exports.say = say;