#!/bin/bash
# A script for non-developers to easily switch between PRs and the master branch

REMOTE="https://github.com/farm-ng/tractor"

if [ "$#" -ne 1 ]
then
  echo "Usage: ./switch.sh <PR# or 'master'>"
  exit 1
fi

if [[ $(git diff --stat) != '' ]]; then
  echo 'Your git working directory is dirty. Please revert or stash your local changes.'
  exit 1
fi

if [ "$1" = "master" ]; then
  git fetch $REMOTE master
  git checkout master
else
  re='^[0-9]+$'
  if ! [[ $1 =~ $re ]]; then
    echo "PR must be a number" >&2
    exit 1
  fi
  git fetch $REMOTE pull/$1/head:pr-$1
  git checkout pr-$1
fi

git submodule update --init --recursive
