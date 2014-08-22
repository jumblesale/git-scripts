                __
               / o) GIT SCRIPTS
        .-^^^-/ /
     __/       /
    <__.|_|-|_|

## review

### Pull a GitHub pull request so you can review it locally

    review --user=jumblesale --repo=git-scripts

Gives you a list of open pull requests. When you select one, the script pulls it then does a soft reset to the local HEAD. This allows you to view all the PR changes as a diff. Super helpful for reviewing a PR in your IDE.

Requires a valid GitHub token. Either provide it on the command line or save it in a .token file in the script directory.

## deploy

### Squash a branch into master then tag and push the new release

    deploy.js --bump=minor --origin=upstream --version=v1.2.0

Pulls the latest version of dev, does a squash merge into master, checks out any conflicts from dev, then commits and tags the result and pushes master back up.

If version is not specified it will try to figure it out from the last tag.

## delete-tags

### Delete all tags from a local and remote repository

    delete-tags

Will remove **ALL** tags from the local and remote repository. Only do this if you're sure that's what you want! There's not going back.

:goat: