#!/usr/bin/nodejs

"use strict"

var GHAPI   = require('github'),
    request = require('request'),
    nom     = require('nomnom'),
    sprintf = require('sprintf-js').sprintf,
    _       = require('underscore'),
    prompt  = require('prompt'),
    Q       = require('q'),
    util    = require('util'),
    fs      = require('fs'),

    scopes  = ['repo'],

    opts  = nom.script('review')
        .option('verbose', {
            abbr:    'v',
            flag:    true,
            help:    'Fill up your terminal',
            default: false
        })
        .option('repo', {
            abbr:     'r',
            help:     'The repo containing the pull request',
            required: true
        })
        .option('origin', {
            help:    'The remote to pull from',
            default: 'origin'
        })
        .option('skip-reset', {
            abbr:    'r',
            flag:    true,
            help:    'Don\'t soft reset to the HEAD of the local branch after pulling',
            default: false
        })
        .option('token', {
            abbr: 't',
            help: 'GitHub token to use - leave blank to use the contents of .token'
        })
        .option('user', {
            abbr: 'u',
            help: 'The github user that the repo belongs to',
            required: true
        })
        .parse(),

    log  = require('./modules/log')('review', opts.verbose),
    git  = require('./modules/git')(log),
    dino = require('./modules/dino'),

    gh = new GHAPI({
        version: "3.0.0",
    }),

    listPullRequests = function(pullRequests) {
        var i = 1;
        _.each(pullRequests, function(pullRequest) {
            var index = i.toString();
            console.log(sprintf(
                '[%s]: %s - %s',
                index.bold,
                pullRequest.number.toString().green.bold,
                pullRequest.head.label.blue
            ));
            i = i + 1;
        });
        return i;
    },

    getIndexFromUser = function(count) {
        var deferred = Q.defer();

        prompt.start();
        prompt.message = 'Select PR to use';

        prompt.get({
            properties: {
                index: {
                    message: sprintf('[1-%d]', count - 1)
                }
            }
        }, function (err, result) {
            if(err) {
                log.fatal('Not a valid option, aborting');
                return deferred.reject();
            } else {
                return deferred.resolve(result.index - 1);
            }
        });

        return deferred.promise;
    },

    auth = function() {
        return Q.fcall(function() {
            gh.authenticate({
                type: 'oauth',
                token: token
            });
        });
    },

    getPullRequests = function(token) {
        var deferred = Q.defer();
        gh.pullRequests.getAll(
            {user: opts.user, repo: opts.repo}, 
            function(err, result) {
                if(err) {
                    return deferred.reject(err);
                } else {
                    return deferred.resolve(result);
                }
        });
        return deferred.promise;
    },

    pullPR = function(pullRequest) {
        var sha       = pullRequest.head.sha,
            localHEAD = git.lastCommitHash();
        log.info(sprintf('Fetching from %s', opts.origin));
        log.info(git.fetch(opts.origin));
        log.info('Checking out HEAD of pull request');
        log.info(git.checkout(sha));
        if(false === opts['skip-reset']) {
            log.info(sprintf('Resetting to %s', localHEAD));
            log.info(git.softReset(localHEAD));
        }
    },

    token = function() {
        if(opts.token) {
            return opts.token
        }
        var file = fs.readFileSync(sprintf('%s/%s', __dirname, '.token'));
        if(!file) {
            log.fatal('No token specified and could not read .token');
        }
        return file;
    }();

dino.say('REVIEW'.bold + ' pull request');

auth()
    .then(getPullRequests)
    .then(function(pullRequests) {
        var count = listPullRequests(pullRequests);
        return getIndexFromUser(count)
            .then(function(index) {
                pullPR(pullRequests[index]);
                log.info('Done!');
            });
    }, function(err) {
        log.fatal(err.message);
        if(err.code && 401 === err.code) {
            log.info(
                'Create a token for this in github: https://github.com/settings/profile > Applications > Generate new token'
            );
            log.info(sprintf('Requires %s scopes', scopes.join(',')));
            
        }
    });