var shell   = require('shelljs'),
    sprintf = require('sprintf-js').sprintf,
    log     = require('./log'),
    tag     = require('./tag'),
    _       = require('underscore'),

    git = {
        checkout: function(branch) {
            return shell.exec(sprintf('git checkout %s', branch), {silent: true}).output.trim();
        },

        checkoutFile: function(branch, file) {
            return shell.exec(sprintf('git checkout %s -- %s', branch, file), {silent: true})
                .output
                .trim();
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

        squash: function(branch) {
            var files = shell
                .exec(sprintf('git diff --name-only --diff-filter=U', branch), {silent: true})
                .output
                .trim()
                .split("\n");

            _.each(files, function(file) {
                git.checkoutFile(branch, file);
            })
        },

        squashMerge: function(branch) {
            return shell.exec(sprintf('git merge -X theirs %s --squash', branch), {silent: true}).output.trim();
        },

        softReset: function(branch) {
            return shell.exec(sprintf('git reset --soft %s', branch), {silent: true}).output.trim();
        },

        commit: function(message) {
            return shell.exec(sprintf('git commit -m"%s"', message), {silent: true}).output.trim();
        },

        tag: function(version, message, commit) {
            return shell.exec(sprintf('git tag -a %s -m"%s" %s', version, message, commit), {silent: true}).output.trim();
        },

        push: function(branch, upstream) {
            result = shell.exec(sprintf('git push %s %s', upstream, branch), {silent: true})

            if(0 !== result.code) {
                log.fatal(sprintf('Could not push %s:%s, aborting', upstream, branch));
                shell.exit(1);
            }

            return result.output.trim();
        },

        pull: function(branch, upstream) {
            result = shell.exec(sprintf('git pull %s %s', upstream, branch), {silent: true});

            if(0 !== result.code) {
                log.fatal(sprintf('Could not pull %s:%s, aborting', upstream, branch));
                shell.exit(1);
            }

            return result.output.trim();
        },

        pushTags: function(branch, upstream) {
            result = shell.exec(sprintf('git push --tags %s %s', upstream, branch), {silent: true})

            if(0 !== result.code) {
                log.fatal(sprintf('Could not push tags to %s:%s, aborting', upstream, branch));
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
    };

module.exports = git;