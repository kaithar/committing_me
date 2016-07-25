#! /bin/bash

set -e

echo "+ virtualenv"
virtualenv --clear --prompt="cme" venv
echo "+ source"
source venv/bin/activate
echo "+ pip"
pip install -r requirements.txt
