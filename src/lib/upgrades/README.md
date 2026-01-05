# upgrades lib

The goal here is to just make a simple lib that helps with the process of setting up upgrades for a game. I started making this for my income_game project, but intend to make it reusable for additional future projects.

## Core Features

The core set of features that I think this should have is as follows:

* (done) have a way to pass a configuration object that will be the hard coded state of the upgrades.
* (done) create objects that will store the current state of upgrades in a game.
* (done) have ug_def objects that ARE NOT effected by the current upgrade level
* (done) have ug objects that ARE effected by the current upgrade level
* (done) return a current save state
* (done) apply a save state
* (    ) have a reset method that will reset the state of the upgrades to the hard coded start point
