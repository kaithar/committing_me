import pygit2
from datetime import datetime, timezone, timedelta

class git_repo(object):
    """Wrap pygit2's repo for convenience"""
    def __init__(self, path):
        super(git_repo, self).__init__()
        self.path = path
        self.repo = pygit2.repository.Repository(self.path)

    def hunt(self, tree, depth=0):
        """This outputs the tree, aka tree of blobs at the given commit
        Depth is there to give you indenting, that's it."""
        print(' '*(depth*2), len(tree))
        for e in tree:
            print(' '*(depth*2), e.id, e.type, e.name)
            if (e.type == 'tree'):
                self.hunt(self.repo[e.id], depth+1)

    def diff_to_parent(self, commit):
        """Just hiding away the ugly way I'm generating diffs"""
        if (len(commit.parents) == 1):
            return commit.tree.diff_to_tree(commit.parents[0].tree, swap=True)
        elif (len(commit.parents) == 0):
            return commit.tree.diff_to_tree(swap=True)
        else:
            print(repr(commit.parents))
            return None

    def patch_splatter(self, patch):
        """Turns out it's easier to eat patch output than to make my own diff"""
        patch.split('\n')
        files = {}
        added = removed = 0
        name_was = None
        for line in patch.split('\n'):
            if len(line) == 0:
                continue
            if line[0:3] == '+++':
                track = {}
                if (line == "+++ /dev/null"): # Deleted file
                    files[name_was] = track
                else:
                    files[line[6:]] = track
                track['added'] = track['removed'] = 0
            elif line[0:3] == '---':
                name_was = line[6:]
                pass
            elif line[0] == '+':
                track['added'] += 1
            elif line[0] == '-':
                track['removed'] += 1
        return files
