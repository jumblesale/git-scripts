var shell   = require('shelljs'),
    sprintf = require('sprintf-js').sprintf,
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

        checkoutRemoteBranch: function(origin, branch) {
            return shell.exec(sprintf('git checkout -b %s %s/%s', branch, origin, branch), {silent: true})
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

        squashMerge: function(branch) {
            var diffMap = {
                    A: function(branch, file) {
                        return shell.exec(sprintf('git rm %s', file), {silent: true}).output.trim();
                    },
                    M: git.checkoutFile,
                    D: git.checkoutFile
                },

                files = shell
                    .exec(sprintf('git diff --name-status %s', branch), {silent: true})
                    .output
                    .trim()
                    .split("\n");

            if(!files) {
                return;
            }

            _.each(files, function(file) {
                var parts  = file.split("\t"),
                    status = parts[0].trim(),
                    path   = parts[1].trim(),
                    action = diffMap[parts[0]];

                log.debug(sprintf('%s: %s', status, path));
                log.info(action(branch, parts[1]));
            });
        },

        getAuthor: function() {
            return shell.exec('git show -s --format="%an <%ae>"', {silent: true}).output.trim();
        },

        softReset: function(branch) {
            return shell.exec(sprintf('git reset --soft %s', branch), {silent: true}).output.trim();
        },

        commit: function(message, author) {
            return shell.exec(sprintf('git commit -m"%s" --author="%s"', message, author), {silent: true}).output.trim();
        },

        lastCommitHash: function() {
            return shell.exec('git rev-parse HEAD', {silent: true}).output.trim();
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

        pushTag: function(branch, upstream, tag) {
            result = shell.exec(sprintf('git push %s %s refs/tags/%s', upstream, branch, tag), {silent: true})

            if(0 !== result.code) {
                log.fatal(sprintf('Could not push tag %s to %s:%s, aborting', tag, upstream, branch));
                shell.exit(1);
            }

            return result.output.trim();
        },

        fetchTags: function(branch, upstream) {
            result = shell.exec(sprintf('git fetch %s %s --tags', upstream, branch), {silent: true});

            if(0 !== result.code) {
                log.fatal(sprintf('Could not fetch %s:%s, aborting', upstream, branch));
                shell.exit(1);
            }

            return result.output.trim();
        },

        fetch: function(upstream) {
            result = shell.exec(sprintf('git fetch %s', upstream), {silent: true});

            if(0 !== result.code) {
                log.fatal(sprintf('Could not fetch from %s, aborting', upstream));
                shell.exit(1);
            }

            return result.output.trim();
        }
    };

module.exports = function(logger) {
    log = logger;
    return git;
}