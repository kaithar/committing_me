# Paths to repos to process...
repos = {
    'data/repos/funchain/': {},
    'data/repos/muhubot/': {},
    'data/repos/salt/': {
        # If you want to process something other than just origin/HEAD, use this:
        'branches': ['origin/HEAD', 'origin/develop']
        # Note that it only eats remote branches, not local ones
    }
}

# Emails for the users you want to include in the output
include_committers = [
    'kaithar@users.noreply.github.com',
]

