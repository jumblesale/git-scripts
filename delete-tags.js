#!/usr/bin/nodejs
var shell   = require('shelljs'),
    _       = require('underscore'),
    prompt  = require('prompt');
    sprintf = require('sprintf-js').sprintf,
    nom     = require('nomnom'),
    colors  = require('colors')

    opts = nom.script('deploy')
        .option('origin', {
            abbr:     'b',
            default:  'origin',
            help:     'Upstream to delete tags from',
        })
        .parse(),

    origin = opts.origin,

    dino = ['            __',
            '           / o)',
            '    .-^^^-/ /',
            ' __/       /',
            '<__.|_|-|_|'],

    intro = function(message) {
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

intro('DELETING TAGS'.bold + sprintf(' from current branch'));

prompt.start();

prompt.get(['continue'], function (err, result) {
    if('Y' !== result.continue.toUpperCase()) {
        shell.exit(1);
    }

    
    var tags = shell
        .exec('git tag')
        .output
        .trim()
        .split("\n");

    _.each(tags, function(tag) {
        shell.exec(sprintf('git push %s :%s', origin, tag));
        shell.exec(sprintf('git tag -d %s', tag));
    });

    shell.exit(0);
});