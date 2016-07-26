import pygit2
from datetime import datetime, timezone, timedelta

from gitparser import git_repo

import config

by_date = {}
test_list = []

for repo_name in config.repos:
    rc = git_repo(repo_name)
    repo = rc.repo

    print("Scanning {}".format(repo_name))
    print(repr(repo.listall_branches(pygit2.GIT_BRANCH_REMOTE)))
    #continue
    visited_hashes = []
    for target in config.repos[repo_name].get('branches',['origin/HEAD']):
        print("Walking {}".format(target))
        #last = repo[repo.head.target]
        last = repo.lookup_branch(target, pygit2.GIT_BRANCH_REMOTE).get_object()
        for commit in repo.walk(last.id, pygit2.GIT_SORT_TIME):
            # We're trying to break out when we encounter a hash twice
            # The idea is to handle multiple branches merging back and forth
            if (commit.id in visited_hashes):
                print("hash match: {}".format(commit.id))
                break
            visited_hashes.append(commit.id)
            # Keep track of authors, in case you need that list
            if commit.author.email not in test_list:
                test_list.append(commit.author.email)
            # Skip details on commits we didn't make.
            if commit.author.email not in config.include_committers:
                continue

            # Now for some debug output bits I borrowed from somewhere
            # ... and then mangled shamelessly
            tzinfo  = timezone( timedelta(minutes=commit.author.offset) )

            dt      = datetime.fromtimestamp(float(commit.author.time), tzinfo)
            timestr = dt.strftime('%c %z')
            # This one line isn't debug specific, we actually need it
            bucket  = dt.strftime('%Y-%m-%d')
            msg     = ['commit {}'.format(commit.id),
                         'Author: {} <{}>'.format(commit.author.name, commit.author.email)]
            if commit.author.email != commit.committer.email:
                msg.append('Committer: {} <{}>'.format(commit.committer.name, commit.committer.email))
            msg += ['Date:   {}'.format(timestr),
                         'Bucket: {}'.format(bucket),
                         '',
                         commit.message]
            msg = '\n'.join(msg)
            print(msg)
            #hunt(commit.tree, 0)
            # end of debug output stuff
            if bucket not in by_date:
                by_date[bucket] = {'commits': 0, 'lines_added': 0, 'lines_removed': 0}
            bucket_dict = by_date[bucket]
            bucket_dict['commits'] += 1

            # diff_to_parent and patch_splatter hide much ugly
            diff = rc.diff_to_parent(commit)
            if (diff and diff.patch):
                pstat = rc.patch_splatter(diff.patch)
                for v in pstat.values():
                    bucket_dict['lines_added'] += v['added']
                    bucket_dict['lines_removed'] += v['removed']
                print(repr(pstat))
            #print('\n'.join(diff.patch.split('\n')[0:15]))
            #print(commit.hex)
            print("------")
            #break
import pprint
#pprint.pprint(test_list)

# This is terrible form, I know, I'll clean it up at some point
import json
f = open(config.output_file, 'w')
f.write('var commits = {};'.format(json.dumps(by_date, indent=2, sort_keys=True)))
#pprint.pprint(test_list)
