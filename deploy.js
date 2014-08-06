#!/usr/bin/nodejs
var shell   = require('shelljs'),
    nom     = require('nomnom'),
    sprintf = require('sprintf-js').sprintf
    util    = require('util'),
    colors  = require('colors'),
    _       = require('underscore'),

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
    }


    opts = nom.script('deploy')
        .option('bump', {
            abbr:     'b',
            choices:  ['major', 'minor', 'patch'],
            help:     'Version to bump - major, minor or patch',
            required: true
        })
        .option('verbose', {
            abbr:    'v',
            flag:    true,
            help:    'Fill up your terminal',
            default: false
        })
        .option('master', {
            abbr:    'm',
            help:    'Target branch for the merge - default \'master\'',
            default: 'master'
        })
        .option('dev', {
            abbr:    'd',
            help:    'Source / topic branch for the merge - default \'dev\'',
            default: 'dev'
        })
        .option('message', {
            help:    'Commit message to use for the merge. {VERSION} will be replaced with the new version',
            default: '{VERSION}'
        })
        .option('origin', {
            help:    'The remote to push master to',
            default: 'origin'
        })
        .parse(),

    log = {
        debug: function(message) {
            if(true === opts.verbose) {
                this.info(sprintf('%s %s', 'DEBUG:'.cyan.inverse, message));
            }
        },
        fatal: function(message) {
            console.error(sprintf('FATAL: %s', message).red.inverse);
        },
        info: function(message) {
            console.log(sprintf('%s %s', 'DEPLOY:'.grey.bold.inverse, message));
        }
    },

    git = {
        checkout: function(branch) {
            return shell.exec(sprintf('git checkout %s', opts.master), {silent: true}).output.trim();
        },
        lastTag: function() {
            var tags = shell
                .exec('git tag -l | sort -V', {silent: true})
                .output
                .trim()
                .split("\n")
                .reverse();

            return _.find(tags, function(line) {
                return tag.hasCorrectFormat(line);
            });
        },
        squashMerge: function(branch) {
            return shell.exec(sprintf('git merge -X theirs %s --squash', branch), {silent: true}).output.trim();
        },
        commit: function(message) {
            return shell.exec(sprintf('git commit -m"%s"', message), {silent: true}).output.trim();
        },
        tag: function(version, message, commit) {
            return shell.exec(sprintf('git tag -a %s -m"%s" %s', version, message, commit), {silent: true}).output.trim();
        },
        push: function(branch, upstream) {
            result = shell.exec(sprintf('git push %s %s --tags', upstream, branch), {silent: true})

            if(0 !== result.code) {
                log.fatal(sprintf('Could not push %s:%s, aborting', upstream, branch));
                shell.exit(1);
            }

            return result.output.trim();
        },
        fetch: function(branch, upstream) {
            result = shell.exec(sprintf('git fetch %s %s --tags', upstream, branch), {silent: true});

            if(0 !== result.code) {
                log.fatal(sprintf('Could not fetch %s:%s, aborting', upstream, branch));
                shell.exit(1);
            }

            return result.output.trim();
        }
    },

    tag = {
        regex: /^(.*)?(\d+)\.(\d+)\.(\d+)$/,

        versionMap: {
            major: 1,
            minor: 2,
            patch: 3
        },

        hasCorrectFormat: function(tag) {
            return this.regex.test(tag);
        },

        bump: function(version, tag) {
            var index = this.versionMap[version] + 1;

            parts = this.regex.exec(tag);
            parts[index] = (parseInt(parts[index], 10) + 1) + '';
            if(2 === index) {
                parts[index + 2] = '0';
                parts[index + 1] = '0';
            }
            if(3 === index) {
                parts[index + 1] = '0';
            }
            return sprintf('%s%s.%s.%s', parts[1], parts[2], parts[3], parts[4]);
        }
    };

intro('DEPLOYING'.bold + sprintf(' %s to %s:%s', opts.dev, opts.origin, opts.master));

log.debug(sprintf('Checking out branch %s', opts.master));

log.info(git.checkout(opts.master));

log.debug('Fetching latest changes');

log.info(git.fetch(opts.master, 'origin'));

var lastTag = git.lastTag();

log.debug(sprintf('Last tag found is %s', lastTag));

if(!lastTag) {
    log.fatal('No valid tags found. Tags should have format [v]x.x.x');
    shell.exit(1);
}

log.debug(sprintf('Doing a %s bump to the version', opts.bump));

var newTag = tag.bump(opts.bump, lastTag);

log.debug(sprintf('New tag will be %s', newTag));

log.debug(sprintf('Squash merging %s into %s...', opts.dev, opts.master));

log.info(git.squashMerge(opts.dev));

log.info(git.commit(opts.message.replace('{VERSION}', newTag)));

log.debug('Tagging new commit...');

git.tag(newTag, newTag, 'HEAD');

log.debug(sprintf('Pushing %s', opts.master));

log.info(git.push(opts.master, 'origin'));