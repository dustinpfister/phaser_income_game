# phaser_income_game change log

```
// fun little code snipit that shows how much money I would have if
// a certain fixed amount of money per month such as 250 was deposited
// into a cash brokerage account, and a certain return such as 3.75 % was 
// applyed on the current total for each month as well
{
    const df = new Date(1983, 4);
    const dt = new Date();
    const per_month = 50;
    const yeild = 0.07 / 100;
    
    const month_diff = function(df, dt) {
        return dt.getMonth() - df.getMonth() +  (12 * ( dt.getFullYear() - df.getFullYear() ) )
    };
    
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    const to_cash = function( cash=0 ){
        return formatter.format( cash )
    };

    const month_ct = month_diff(df, dt);
    let i = 0, deposits=0, total=0;
    while(i < month_ct){
        deposits += per_month;
        total += deposits;
        const gains = total * ( yeild / 12);
        total += gains;
        console.log(i, to_cash( deposits), to_cash( gains ), to_cash( total ) );
        i += 1;
    }
}

```


## () R6 - big number library
* () start a bug number library that just makes use of BigInt

## () R5 - improved rendering
* () replace per button graphics with sprites

## () R4 - improved button objects
* () add button returns a group object with graphics and bitmap text as children

## () R3 - save only stores values that need to be saved
* () new state object that stores values that can be found from save data such as cash
* () cash and upgrade costs do not need to be stored in the save state
* () time does not need to be stored in an auto clicker object

## () R2 - clicks lib
* () start a lib/assets for working with 'clicks'
* () finish work on 5 x 7 font

## () R1 - upgrade, save,  libs
* (done) start a lib/upgrades to hold upgrade code
* () use upgrade lib in game state
* () start a lib/save to hold save state manager code
* () use save lib in boot state for
* () upgrades object in save state can start out as an empty object
* () more work done on 5 x 7 font


## ( done 01/04/2026 ) R0 - Core Idea Working
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
* (done) fav icon






