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

# Output location
output_file = 'data/commits.js'

# Project groups.  Description field is optional, repos is not.
# Not all repos have to be in a project, this is just for ones you want to have separately from the "everything".
projects = {
    'Commit analysis': { 'repos': ['./'], 'description': "The code that makes this stuff" },
    'Another Horrible Markup Language': {
        'repos': ['data/repos/ahml/'],
        'description': 'A web-specific markup language' },
    'Audacious': {
        'repos': ['data/repos/audacious/', 'data/repos/audacious-plugins/'],
        'description': 'Audacious Media Player' },
    'Salt interface': {'repos': ['data/repos/saline/']}
}
