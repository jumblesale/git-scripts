#!/usr/bin/nodejs

var sprintf = require('sprintf-js').sprintf,
    shell   = require('shelljs'),
    nom     = require('nomnom'),
    prompt  = require('prompt'),
    _       = require('underscore'),
    dino    = require('./modules/dino'),

    opts    = nom.script('deploy')
        .option('origin', {
            help:    'The remote to push master to',
            default: 'origin'
        })
        .parse(),

    origin = opts.origin;


dino.say('DELETING TAGS'.bold + sprintf(' from current branch'));

prompt.start();
prompt.message   = 'This will delete ALL tags from the local and remote branch! BE SURE YOU WANT TO DO THIS!';

prompt.get({
    properties: {
        continue: {
            message: 'continue [y/N]?'
        }
    }
}, function (err, result) {
    if(!result) {
        shell.exit(1);
    }

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