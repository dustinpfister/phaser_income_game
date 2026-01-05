import { Upgrades } from './upgrades.js';

const up = new Upgrades({
    shared: {
        cap: 30,
        rates: [0.01,0.05,0.10,0.25,0.50,1,5,10,50,100],
        times: [3,5,6.5,10,15,24.5,35,50,57,100]
    },
    upgrades: {
        mc0: { start:      1, base: 2.00 },
        ac0: { start:      1, base: 2.00 }, ac1: { start:   100, base: 2.00 }, ac2: { start:   250, base: 2.00 }, 
        ac3: { start:    750, base: 2.00 }, ac4: { start:  1250, base: 2.00 }, ac5: { start:  5000, base: 2.00 }, 
        ac6: { start:  12000, base: 2.00 }, ac7: { start: 25000, base: 2.00 }, ac8: { start: 50000, base: 2.00 }, 
        ac9: { start: 100000, base: 2.00 }
    },
    get_cost: ( ug, level, config ) => {
        if(level > config.shared.cap){
            return Infinity;
        }
        const ug_def = config.upgrades[ug.key];
        return ug_def.start * level + Math.pow( ug_def.base, level );
    },
    for_level: ( ug, level, config ) => {
        if(ug.type === 'mc'){
            ug.rate = config.shared.rates[ ug.level ];
        }
        if(ug.type === 'ac'){
            ug.rate = config.shared.rates[ ug.type_index ];
            const time_start = config.shared.times[ ug.type_index ] * 1000;
            ug.time =  ( 1 - Upgrades.dim_return(level, 30) ) * time_start; 
        }
    }
});

console.log( up.objects );
//console.log( up.get_ug_def( up.objects.ac6 ) );
