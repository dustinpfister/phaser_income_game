# phaser_income_game change log

## () R3 - improved button objects
* () add button returns a group object with graphics and bitmap text as children

## () R2 - save only stores values that need to be saved
* () new state object that stores values that can be found from save data such as cash
* () cash and upgrade costs do not need to be stored in the save state
* () time does not need to be stored in an auto clicker object

## () R1 - upgrade, save, and click libs
* () start a lib/save to hold save state manager code
* () start a lib/upgrades to hold upgrade code
* () upgrades object in save state can start out as an empty object
* () finish work on 5 x 7 font

## () R0 - Core Idea Working
* (done) User clicks a manual income button
* (done) The Manual income button can be upgraded
* (done) The user can buy and upgrade auto clickers
* (done) use the dim return function to help set the auto clicker time
* (done) per hour rates should reflect the current state of the auto clicker
* (done) auto clicker in save state can start as an empty array
* (done) display upgrade cost for auto clickers
* (done) reset start time of auto clicker when upgraded for the first time
* (done) start a game state
* (done) rename state global to save
* (done) load save in boot state and set it to the registry
* (done) have boot state define an egg global that can be used to reset the game
* (done) level cap for manual upgrades
* (done) have a 5 x 7 font
* () fav icon






